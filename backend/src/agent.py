import logging
import json
import os
import asyncio
import uuid
from datetime import datetime
from typing import Annotated, Literal, Optional, List, Dict
from dataclasses import dataclass
import sys
import os
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Add src directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from mongodb_utils import load_bookings, save_booking, get_booking, update_booking



from dotenv import load_dotenv
from pydantic import Field
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    function_tool,
    RunContext,
)

from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")
load_dotenv(".env.local")



HOTELS_FILE = "hotels.json"
BOOKINGS_FILE = "booking.json"

# Travel modes data
TRAVEL_MODES = {
    "bus": {"cost_per_km": 2, "speed_kmh": 50, "description": "Comfortable bus service with AC"},
    "train": {"cost_per_km": 1.5, "speed_kmh": 60, "description": "Railway service with various classes"},
    "plane": {"cost_per_km": 5, "speed_kmh": 500, "description": "Air travel for long distances"},
    "private_car": {"cost_per_km": 10, "speed_kmh": 40, "description": "Private vehicle for short distances"}
}

# Sample distances from major cities (in km)
DISTANCES = {
    # Delhi connections
    ("Delhi", "Mumbai"): 1400,
    ("Delhi", "Goa"): 1800,
    ("Delhi", "Jaipur"): 280,
    ("Delhi", "Bangalore"): 2150,
    ("Delhi", "Kerala"): 2700,
    ("Delhi", "Kolkata"): 1500,
    ("Delhi", "Hyderabad"): 1550,
    ("Delhi", "Udaipur"): 660,
    ("Delhi", "Agra"): 230,
    ("Delhi", "Chennai"): 2200,
    ("Delhi", "Shimla"): 350,
    ("Delhi", "Manali"): 540,
    # Mumbai connections
    ("Mumbai", "Goa"): 580,
    ("Mumbai", "Jaipur"): 1200,
    ("Mumbai", "Bangalore"): 980,
    ("Mumbai", "Kerala"): 1300,
    ("Mumbai", "Kolkata"): 2000,
    ("Mumbai", "Hyderabad"): 710,
    ("Mumbai", "Udaipur"): 650,
    ("Mumbai", "Agra"): 1200,
    ("Mumbai", "Chennai"): 1330,
    ("Mumbai", "Shimla"): 1700,
    ("Mumbai", "Manali"): 1900,
    # Goa connections
    ("Goa", "Jaipur"): 1600,
    ("Goa", "Bangalore"): 560,
    ("Goa", "Kerala"): 600,
    ("Goa", "Kolkata"): 1900,
    ("Goa", "Hyderabad"): 660,
    ("Goa", "Chennai"): 900,
    # Bangalore connections
    ("Bangalore", "Kerala"): 550,
    ("Bangalore", "Kolkata"): 1870,
    ("Bangalore", "Hyderabad"): 570,
    ("Bangalore", "Chennai"): 350,
    ("Bangalore", "Jaipur"): 1900,
    # Kerala connections
    ("Kerala", "Chennai"): 700,
    ("Kerala", "Hyderabad"): 1000,
    ("Kerala", "Kolkata"): 2100,
    # Kolkata connections
    ("Kolkata", "Hyderabad"): 1500,
    ("Kolkata", "Chennai"): 1670,
    ("Kolkata", "Jaipur"): 1500,
    # Hyderabad connections
    ("Hyderabad", "Chennai"): 630,
    ("Hyderabad", "Jaipur"): 1400,
    ("Hyderabad", "Udaipur"): 1100,
    # Udaipur connections
    ("Udaipur", "Jaipur"): 400,
    ("Udaipur", "Agra"): 630,
    # Agra connections
    ("Agra", "Jaipur"): 240,
    # Shimla connections
    ("Shimla", "Manali"): 250,
    ("Shimla", "Jaipur"): 600,
    # Chennai connections
    ("Chennai", "Jaipur"): 2000
}

def load_hotels():
    """Load hotel data from JSON file."""
    try:
        path = os.path.join(os.path.dirname(__file__), HOTELS_FILE)
        if not os.path.exists(path):
            logger.error(f"{HOTELS_FILE} not found.")
            return {}
        with open(path, "r", encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading hotels: {e}")
        return {}

# Load hotel data immediately on startup
HOTEL_DATA = load_hotels()


@dataclass
class TravelState:
    """Tracks the current travel planning context"""
    origin: str | None = None
    destination: str | None = None
    travel_dates: str | None = None
    num_adults: int = 0
    num_children: int = 0
    preferences: Dict[str, any] = None
    selected_mode: str | None = None
    selected_hotel: Dict | None = None
    booking_id: str | None = None
    customer_name: str | None = None
    mobile_number: str | None = None
    email: str | None = None

    def __post_init__(self):
        if self.preferences is None:
            self.preferences = {}

@dataclass
class Userdata:
    travel_state: TravelState
    agent_session: Optional[AgentSession] = None


async def send_booking_email(booking: dict) -> bool:
    """Send booking confirmation email to customer."""
    try:
        sender_email = os.getenv("SMTP_EMAIL")
        sender_password = os.getenv("SMTP_PASSWORD")
        
        if not sender_email or not sender_password:
            logger.error("SMTP credentials not found in environment variables")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = booking['email']
        msg['Subject'] = f"Booking Confirmation - Sacred Trails India ({booking['booking_id']})"
        
        # Create email body
        body = f"""
Dear {booking['customer_name']},

Thank you for choosing Sacred Trails India! Your booking has been confirmed.

🎉 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: {booking['booking_id']}
Customer: {booking['customer_name']}
Mobile: {booking['mobile_number']}
Email: {booking['email']}

Trip Information:
Destination: {booking['destination']}
Travel Mode: {booking['travel_mode'].title()}
Hotel: {booking['hotel_name']}
Travel Dates: {booking['dates']}
Number of Travelers: {booking['num_travelers']}
Hotel Rating: {booking['hotel_rating']} stars

💰 COST BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Cost: ₹{booking['total_cost']}

Hotel: ₹{booking['hotel_price_per_night']}/night for {booking['num_travelers']} travelers

🏨 Hotel Details:
{booking['hotel_description']}

Hotel Amenities: {', '.join(booking['hotel_amenities'])}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Status: {booking['status'].title()}
📅 Booking Time: {booking['timestamp']}

Please save this email for your records. If you have any questions or need assistance, 
feel free to contact us.

Safe travels and enjoy your trip to {booking['destination']}!

Best regards,
Nikhil from Sacred Trails India
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated confirmation email. Please do not reply to this email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            text = msg.as_string()
            server.sendmail(sender_email, booking['email'], text)
        
        logger.info(f"Booking confirmation email sent successfully to {booking['email']}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email: {str(e)}")
        return False


@function_tool
async def set_destination(
    ctx: RunContext[Userdata],
    destination: Annotated[str, Field(description="The destination city in India")]
) -> str:
    """Sets the destination for travel planning."""
    state = ctx.userdata.travel_state
    if destination.title() not in HOTEL_DATA:
        available = ", ".join(HOTEL_DATA.keys())
        return f"Sorry, we don't have hotels in {destination}. Available destinations: {available}. Please choose from these."
    state.destination = destination.title()
    return f"Great choice! {state.destination} is a wonderful destination. Now, where are you traveling from?"

@function_tool
async def set_origin(
    ctx: RunContext[Userdata],
    origin: Annotated[str, Field(description="The origin city")]
) -> str:
    """Sets the origin city."""
    state = ctx.userdata.travel_state
    state.origin = origin.title()
    return f"Got it, traveling from {state.origin}. What are your travel dates?"

@function_tool
async def set_travel_dates(
    ctx: RunContext[Userdata],
    dates: Annotated[str, Field(description="Travel dates")]
) -> str:
    """Sets the travel dates."""
    state = ctx.userdata.travel_state
    state.travel_dates = dates
    return f"Travel dates set: {dates}. How many adults and children are traveling?"

@function_tool
async def set_travelers(
    ctx: RunContext[Userdata],
    num_adults: Annotated[int, Field(description="Number of adults")],
    num_children: Annotated[int, Field(description="Number of children")]
) -> str:
    """Sets the number of travelers."""
    state = ctx.userdata.travel_state
    state.num_adults = num_adults
    state.num_children = num_children
    return f"{num_adults} adults and {num_children} children. What's your budget range? (low, medium, or high)"

@function_tool
async def set_budget(
    ctx: RunContext[Userdata],
    budget: Annotated[str, Field(description="Budget range: low, medium, or high")]
) -> str:
    """Sets the budget preference."""
    state = ctx.userdata.travel_state
    if budget.lower() not in ["low", "medium", "high"]:
        return "Please choose low, medium, or high for budget."
    state.preferences["budget"] = budget.lower()
    return f"Budget set to {budget}. Any preferred amenities? (e.g., 'Wi-Fi, Pool, Breakfast' or 'none')"

@function_tool
async def set_amenities(
    ctx: RunContext[Userdata],
    amenities: Annotated[str, Field(description="Preferred amenities or 'none'")]
) -> str:
    """Sets the amenities preferences."""
    state = ctx.userdata.travel_state
    if amenities.lower() == "none":
        state.preferences["amenities"] = []
    else:
        state.preferences["amenities"] = [a.strip() for a in amenities.split(",")]
    return "Preferences set! Now let's find the best travel options for you."

@function_tool
async def select_travel_mode(
    ctx: RunContext[Userdata],
    mode: Annotated[str, Field(description="Travel mode: 'bus', 'train', 'plane', or 'private_car'")]
) -> str:
    """Selects the travel mode and calculates costs/duration."""
    state = ctx.userdata.travel_state
    if not state.origin or not state.destination:
        return "Please set travel details first."

    distance = DISTANCES.get((state.origin, state.destination), DISTANCES.get((state.destination, state.origin), 500))  # default 500km
    mode_data = TRAVEL_MODES.get(mode.lower())
    if not mode_data:
        return f"Invalid mode. Available: {', '.join(TRAVEL_MODES.keys())}"

    cost = distance * mode_data["cost_per_km"] * (state.num_adults + state.num_children)
    duration_hours = distance / mode_data["speed_kmh"]
    state.selected_mode = mode.lower()

    return f"Selected {mode}: Distance {distance}km, Cost ₹{cost}, Duration {duration_hours:.1f} hours. {mode_data['description']}."

@function_tool
async def suggest_hotels(
    ctx: RunContext[Userdata]
) -> str:
    """Suggests hotels based on destination and preferences."""
    state = ctx.userdata.travel_state
    if not state.destination:
        return "Please set destination first."

    hotels = HOTEL_DATA.get(state.destination, [])
    if not hotels:
        return f"No hotels found for {state.destination}."

    # Filter by preferences
    filtered = []
    for hotel in hotels:
        if not hotel["availability"]:
            continue
        if state.preferences.get("budget") == "low" and hotel["price_per_night"] > 5000:
            continue
        if state.preferences.get("budget") == "high" and hotel["price_per_night"] < 15000:
            continue
        if state.preferences.get("amenities"):
            if not all(amenity in hotel["amenities"] for amenity in state.preferences["amenities"]):
                continue
        filtered.append(hotel)

    if not filtered:
        filtered = hotels[:3]  # fallback to first 3

    suggestions = []
    for hotel in filtered[:3]:
        suggestions.append(f"{hotel['name']} ({hotel['rating']}★) - ₹{hotel['price_per_night']}/night - {hotel['description']}")

    return f"Hotel suggestions for {state.destination}:\n" + "\n".join(suggestions) + "\n\nPlease select a hotel by name."

@function_tool
async def select_hotel(
    ctx: RunContext[Userdata],
    hotel_name: Annotated[str, Field(description="The name of the selected hotel")]
) -> str:
    """Selects a hotel for booking."""
    state = ctx.userdata.travel_state
    if not state.destination:
        return "Please set destination first."

    hotels = HOTEL_DATA.get(state.destination, [])
    hotel = next((h for h in hotels if h["name"].lower() == hotel_name.lower()), None)
    if not hotel:
        return f"Hotel '{hotel_name}' not found. Available: {', '.join([h['name'] for h in hotels])}"

    state.selected_hotel = hotel
    return f"Selected {hotel['name']}. Before I can proceed with your booking, I need to collect your contact details."

@function_tool
async def set_customer_name(
    ctx: RunContext[Userdata],
    customer_name: Annotated[str, Field(description="Customer's full name")]
) -> str:
    """Sets the customer's name for booking."""
    state = ctx.userdata.travel_state
    state.customer_name = customer_name.strip()
    return f"Thank you, {state.customer_name}. Now I'll need your mobile number for booking confirmations."

@function_tool
async def set_mobile_number(
    ctx: RunContext[Userdata],
    mobile_number: Annotated[str, Field(description="Customer's mobile number")]
) -> str:
    """Sets the customer's mobile number."""
    state = ctx.userdata.travel_state
    # Basic validation for mobile number (10 digits)
    clean_number = ''.join(filter(str.isdigit, mobile_number))
    if len(clean_number) < 10:
        return "Please provide a valid mobile number with at least 10 digits."
    
    state.mobile_number = clean_number
    return f"Mobile number saved. Finally, I'll need your email address for booking confirmations and receipts."

@function_tool
async def set_email(
    ctx: RunContext[Userdata],
    email: Annotated[str, Field(description="Customer's email address")]
) -> str:
    """Sets the customer's email address."""
    state = ctx.userdata.travel_state
    # Basic email validation
    if '@' not in email or '.' not in email:
        return "Please provide a valid email address."
    
    state.email = email.strip().lower()
    return f"Email saved. Perfect! Now I have all your details. Shall I proceed with booking confirmation?"

@function_tool
async def confirm_booking(
    ctx: RunContext[Userdata]
) -> str:
    """Confirms and creates the booking with collected customer details."""
    state = ctx.userdata.travel_state
    if not all([state.destination, state.selected_mode, state.selected_hotel, state.customer_name, state.mobile_number, state.email]):
        missing = []
        if not state.destination: missing.append("destination")
        if not state.selected_mode: missing.append("travel mode")
        if not state.selected_hotel: missing.append("hotel selection")
        if not state.customer_name: missing.append("customer name")
        if not state.mobile_number: missing.append("mobile number")
        if not state.email: missing.append("email address")
        return f"Please complete all selections first. Missing: {', '.join(missing)}."

    # Calculate total cost
    distance = DISTANCES.get((state.origin, state.destination), DISTANCES.get((state.destination, state.origin), 500))
    mode_data = TRAVEL_MODES[state.selected_mode]
    travel_cost = distance * mode_data["cost_per_km"] * (state.num_adults + state.num_children)

    # Assume 3 nights for simplicity
    hotel_cost = state.selected_hotel["price_per_night"] * 3 * (state.num_adults + state.num_children)
    total_cost = travel_cost + hotel_cost

    booking_id = str(uuid.uuid4())[:8].upper()
    booking = {
        "booking_id": booking_id,
        "customer_name": state.customer_name,
        "mobile_number": state.mobile_number,
        "email": state.email,
        "destination": state.destination,
        "travel_mode": state.selected_mode,
        "hotel_name": state.selected_hotel["name"],
        "dates": state.travel_dates,
        "num_travelers": state.num_adults + state.num_children,
        "total_cost": total_cost,
        "status": "confirmed",
        "timestamp": datetime.now().isoformat(),
        "hotel_rating": state.selected_hotel.get("rating"),
        "hotel_amenities": state.selected_hotel.get("amenities", []),
        "hotel_description": state.selected_hotel.get("description", ""),
        "hotel_price_per_night": state.selected_hotel.get("price_per_night")
    }

    if save_booking(booking):
        state.booking_id = booking_id
    else:
        return "Failed to save booking. Please try again."

    # Send booking confirmation email
    email_sent = await send_booking_email(booking)
    if not email_sent:
        logger.warning(f"Failed to send email for booking {booking_id}")

    # Create booking data JSON for frontend to parse
    booking_json = json.dumps({
        "booking_id": booking_id,
        "user_name": state.customer_name,
        "destination": state.destination,
        "travel_mode": state.selected_mode,
        "hotel_name": state.selected_hotel["name"],
        "dates": state.travel_dates,
        "num_travelers": state.num_adults + state.num_children,
        "total_cost": total_cost,
        "status": "confirmed",
        "timestamp": datetime.now().isoformat(),
        "hotel_rating": state.selected_hotel.get("rating"),
        "hotel_amenities": state.selected_hotel.get("amenities", []),
        "hotel_description": state.selected_hotel.get("description", ""),
        "hotel_price_per_night": state.selected_hotel.get("price_per_night")
    })

    email_status = " (confirmation email sent)" if email_sent else " (email failed)"
    return f"Your booking has been confirmed! Booking ID is {booking_id}. The total cost is {total_cost} rupees. I've displayed the complete booking details on your screen and sent you a confirmation email{email_status}. Thank you for choosing Sacred Trails India! [BOOKING_DATA]{booking_json}[/BOOKING_DATA]"

@function_tool
async def retrieve_booking(
    ctx: RunContext[Userdata],
    booking_id: Annotated[str, Field(description="The booking ID to retrieve")]
) -> str:
    """Retrieves booking details by ID."""
    booking = get_booking(booking_id)
    if not booking:
        return f"Booking ID {booking_id} not found."

    return f"Booking {booking['booking_id']}: {booking['customer_name']} - {booking['travel_mode']} to {booking['destination']}, {booking['hotel_name']}, {booking['dates']}, {booking['num_travelers']} travelers, ₹{booking['total_cost']}, Status: {booking['status']}. Contact: {booking['mobile_number']}, {booking['email']}"

@function_tool
async def cancel_booking(
    ctx: RunContext[Userdata],
    booking_id: Annotated[str, Field(description="The booking ID to cancel")]
) -> str:
    """Cancels a booking."""
    booking = get_booking(booking_id)
    if not booking:
        return f"Booking ID {booking_id} not found."

    if booking["status"] == "cancelled":
        return "Booking already cancelled."

    if update_booking(booking_id, {"status": "cancelled"}):
        refund = booking["total_cost"] * 0.8  # 80% refund
        return f"Booking {booking_id} cancelled. Refund amount: ₹{refund}."
    else:
        return "Failed to cancel booking. Please try again."

# ======================================================
# 🧠 AGENT DEFINITION
# ======================================================

class TravelAgent(Agent):
    def __init__(self):
        # Generate list of destinations for the prompt
        destinations = "\n".join([f"* {dest}" for dest in HOTEL_DATA.keys()])

        super().__init__(
            instructions=f"""
            You are Nikhil from "Sacred Trails India", a friendly and professional AI travel agent specializing in trips within India.

            🏖️ **AVAILABLE DESTINATIONS:** {destinations}

            🚀 **CONVERSATION FLOW:**
            1. **Greeting:** Warmly greet the user and ask for their desired destination.
            2. **Step-by-Step Collection:** After each response, ask the next question in sequence:
               - After destination: Ask for origin city
               - After origin: Ask for travel dates
               - After dates: Ask for number of adults and children
               - After travelers: Ask for budget range
               - After budget: Ask for preferred amenities
            3. **Travel Mode:** Once all details collected, suggest modes (bus, train, plane, private_car) with costs/durations using `select_travel_mode`.
            4. **Hotels:** Suggest hotels using `suggest_hotels`, then let user select with `select_hotel`.
            5. **Customer Details:** Collect contact information in sequence:
               - Ask for customer name using `set_customer_name`
               - Ask for mobile number using `set_mobile_number`
               - Ask for email address using `set_email`
            6. **Booking Confirmation:** After collecting all details, summarize itinerary and use `confirm_booking` to create booking.
            7. **Retrieval:** Handle booking lookups with `retrieve_booking`.
            8. **Cancellations:** Process cancellations with `cancel_booking`.

            ⚙️ **IMPORTANT RULES:**
            - Start every conversation with a warm greeting: "Hello! Welcome to Sacred Trails India. I'm Nikhil, your travel assistant, here to help you plan your perfect trip within India."
            - Ask questions ONE AT A TIME in the specified sequence. Wait for user response before proceeding to next question.
            - Be enthusiastic, helpful, and professional.
            - Use tools for all actions - don't simulate them.
            - Handle errors gracefully (invalid destinations, unavailable options).
            - Default to English, but be prepared for basic Hindi phrases.
            - Always end interactions by offering further assistance.
            - Calculate costs realistically and provide clear breakdowns.
            - For short distances (<300km), prioritize private car or bus.
            - For long distances (>1000km), suggest plane or train.
            
            📝 **FORMATTING RULES FOR SUMMARIES:**
            - NEVER use markdown formatting like ** or * in your responses.
            - When providing trip summaries, format each item on a new line with a period at the end.
            - Example format:
              Destination: Mumbai.
              Origin: Kolkata.
              Travel Dates: December 12th to December 18th.
              Travelers: 2 Adults, 0 Children.
              Budget: Medium.
              Amenities: Wi-Fi, Breakfast.
              Travel Mode: Plane.
              Hotel: ITC Grand Central.
              Customer Name: John.
              Mobile Number: 9191919191.
              Email: john@example.com.
            - Keep responses clean and easy to read without any special formatting characters.
            """,
            tools=[set_destination, set_origin, set_travel_dates, set_travelers, set_budget, set_amenities, select_travel_mode, suggest_hotels, select_hotel, set_customer_name, set_mobile_number, set_email, confirm_booking, retrieve_booking, cancel_booking],
        )


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}


    # 1. Initialize State
    userdata = Userdata(travel_state=TravelState())

    # 2. Setup Agent
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="en"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-IN-Nikhil",
            style="Conversational",
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        userdata=userdata,
    )

    # 3. Store session in userdata for tools to access
    userdata.agent_session = session

    # 4. Start
    await session.start(
        agent=TravelAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))