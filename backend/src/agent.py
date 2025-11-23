import os
import json
import asyncio
import logging
import random
import string
from datetime import datetime, UTC

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
    tokenize,
)

from livekit.plugins import murf, deepgram, google, silero, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")


# ---------------------------------------------------------
#   BUSINESS LOGIC — Pricing & Order Management
# ---------------------------------------------------------

# Coffee pricing structure
PRICING = {
    "latte": {"small": 3.50, "medium": 4.00, "large": 4.50},
    "cappuccino": {"small": 3.25, "medium": 3.75, "large": 4.25},
    "espresso": {"small": 2.50, "medium": 2.75, "large": 3.00},
    "americano": {"small": 3.00, "medium": 3.25, "large": 3.50},
    "mocha": {"small": 4.00, "medium": 4.50, "large": 5.00},
}

# Extras pricing
EXTRA_PRICES = {
    "whipped cream": 0.50,
    "caramel syrup": 0.75,
    "vanilla syrup": 0.75,
    "hazelnut syrup": 0.75,
    "chocolate syrup": 0.50,
}

def generate_order_number():
    """Generate a unique order number"""
    return f"CC{random.randint(1000, 9999)}"

def calculate_preparation_time(drink, size, extras):
    """Calculate estimated preparation time"""
    base_time = {
        "espresso": 2,
        "americano": 3,
        "cappuccino": 4,
        "latte": 5,
        "mocha": 6
    }
    
    # Base preparation time
    time_minutes = base_time.get(drink, 4)
    
    # Add time for size (larger drinks take longer)
    if size == "large":
        time_minutes += 1
    elif size == "small":
        time_minutes -= 1
    
    # Add time for extras
    time_minutes += len(extras) * 0.5
    
    # Round to nearest minute
    return max(2, round(time_minutes))

def calculate_total_price(drink, size, extras):
    """Calculate total price including extras"""
    # Base drink price
    base_price = PRICING.get(drink, {}).get(size, 0)
    
    # Extras price
    extras_price = 0
    for extra in extras:
        extras_price += EXTRA_PRICES.get(extra, 0.50)  # Default $0.50 per extra
    
    total = base_price + extras_price
    return round(total, 2)

# ---------------------------------------------------------
#   CODECAFE BARISTA LLM — Friendly + Structured
# ---------------------------------------------------------
class BaristaAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are **CodeCafe Barista AI**, a friendly barista. "
                "You must collect coffee order details step-by-step. "
                "Ask only **one question at a time**. "
                "Never guess — always confirm if unclear.\n\n"
                "Collect in this order:\n"
                "1. Drink (latte / cappuccino / espresso / americano / mocha)\n"
                "2. Size (small / medium / large)\n"
                "3. Milk (regular / oat / almond / soy)\n"
                "4. Extras (whipped cream / syrups / none)\n"
                "5. Customer name\n\n"
                "Be warm, short, friendly. "
                "Always greet first: "
                "'Welcome to Code Cafe! What would you like to order today?'"
            )
        )


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


# ---------------------------------------------------------
#   MAIN ENTRYPOINT
# ---------------------------------------------------------
async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    # Session (STT, LLM, TTS, VAD)
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="hi-IN-Aman",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        vad=ctx.proc.userdata["vad"],
        turn_detection=MultilingualModel(),
        preemptive_generation=True,
    )

    # Metrics
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        logger.info(f"Usage Summary: {usage_collector.get_summary()}")

    ctx.add_shutdown_callback(log_usage)

    # Start session
    await session.start(
        agent=BaristaAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

    # GREETING
    await session.say("Welcome to Code Cafe! What would you like to order today?")

    # ORDER STRUCTURE
    order = {
        "drink": "",
        "size": "",
        "milk": "",
        "extras": [],
        "name": "",
    }
    
    logger.info("Starting order collection process...")

    # Listen system
    last_text = {"text": ""}
    transcript_event = asyncio.Event()

    @session.on("transcript")
    async def _on_transcript(ev):
        t = getattr(ev, "transcript", None) or getattr(ev, "text", None)
        if t:
            last_text["text"] = t
            transcript_event.set()

    async def wait_text():
        transcript_event.clear()
        try:
            await asyncio.wait_for(transcript_event.wait(), timeout=15)
            return last_text["text"].strip()
        except asyncio.TimeoutError:
            return None

    async def ask(question, list_mode=False):
        await session.say(question)
        reply = await wait_text()

        if not reply:
            await session.say("Sorry, I didn’t catch that. Could you repeat?")
            reply = await wait_text()

        if not reply:
            return None

        reply = reply.lower()

        if list_mode:
            if reply in ["none", "no"]:
                return []
            return [x.strip() for x in reply.replace(" and ", ",").split(",")]

        return reply

    # Questions
    q_list = [
        ("drink", "What drink would you like? Latte, cappuccino, espresso, americano or mocha?"),
        ("size", "What size do you prefer? Small, medium or large?"),
        ("milk", "What kind of milk would you like? Regular, oat, almond or soy?"),
        ("extras", "Any extras? Whipped cream, syrups? Say 'none' if no extras.", True),
        ("name", "Finally, may I know your name?"),
    ]

    for field, prompt, *extra in q_list:
        list_mode = extra[0] if extra else False
        logger.info(f"Asking for {field}: {prompt}")
        
        ans = await ask(prompt, list_mode)
        logger.info(f"Received answer for {field}: {ans}")

        if ans is None:
            logger.error(f"No answer received for {field}, ending conversation")
            await session.say("Sorry, I'm having trouble understanding. Let's continue later. Goodbye!")
            await session.close()
            return

        order[field] = ans
        logger.info(f"Set {field} = {ans}")

    logger.info("Order collection completed successfully!")
    logger.info(f"Final order data: {order}")
    
    # -------------------------------------------------
    # SAVE ORDER TO JSON
    # -------------------------------------------------
    logger.info("Starting order saving process...")
    # Calculate business logic data
    order_number = generate_order_number()
    total_price = calculate_total_price(order["drink"], order["size"], order["extras"])
    estimated_time = calculate_preparation_time(order["drink"], order["size"], order["extras"])
    
    # Add comprehensive timestamp to order data
    order_data = {
        **order,
        "order_number": order_number,
        "timestamp": datetime.now(UTC).isoformat(),
        "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S'),
        "total_price": total_price,
        "estimated_time": f"{estimated_time} minutes",
        "currency": "USD",
        "payment_status": "pending",
        "order_status": "confirmed"
    }
    
    # Get the current script directory and create orders path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    orders_dir = os.path.join(script_dir, "..", "orders")
    
    # Debug logging
    logger.info(f"Script directory: {script_dir}")
    logger.info(f"Orders directory: {orders_dir}")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Order data to save: {order_data}")
    
    try:
        os.makedirs(orders_dir, exist_ok=True)
        filename = os.path.join(orders_dir, f"order_{order_data['order_id']}.json")
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)
        
        logger.info(f"Order successfully saved to: {filename}")
        
    except Exception as e:
        logger.error(f"Failed to save order: {e}")
        # Continue with the session even if saving fails

    # Final message with business logic
    extras_text = ", ".join(order["extras"]) if order["extras"] else "no extras"

    await session.say(
        f"Perfect! Order #{order_data['order_number']} confirmed for {order['name']}. "
        f"You ordered a {order['size']} {order['drink']} with {order['milk']} milk and {extras_text}. "
        f"Total: ${order_data['total_price']}. "
        f"Estimated preparation time: {order_data['estimated_time']}. "
        f"Your order has been saved and will be prepared shortly. Have a great day!"
    )

    # END CALL AFTER CONFIRMATION
    await ctx.room.disconnect()
    await session.close()


# ---------------------------------------------------------
# WORKER INIT
# ---------------------------------------------------------
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
