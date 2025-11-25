import logging
import json
import os
import asyncio
from typing import Annotated, Literal, Optional
from dataclasses import dataclass



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



CONTENT_FILE = "programming.json" 


DEFAULT_CONTENT = [
{
    "id": "constants",
    "title": "Constants",
    "summary": "Constants store values that cannot be changed once assigned. They help prevent accidental modification of important data.",
    "sample_question": "What is a constant and how is it different from a variable?"
},
{
    "id": "operators",
    "title": "Operators",
    "summary": "Operators are symbols that perform operations on values, such as arithmetic (+, -), comparison (==, >), or logical (&&, ||).",
    "sample_question": "What are operators and why are they used in programming?"
},
{
    "id": "comments",
    "title": "Comments",
    "summary": "Comments are notes in code that explain what it does. They are ignored by the computer but help developers understand the logic.",
    "sample_question": "Why are comments important in programming?"
},
{
    "id": "boolean_logic",
    "title": "Boolean Logic",
    "summary": "Boolean logic deals with true or false values. It is essential for decision-making in programs using AND, OR, and NOT.",
    "sample_question": "What is boolean logic and where is it used in programming?"
},
{
    "id": "input_output",
    "title": "Input & Output",
    "summary": "Input is information the program receives from the user or system. Output is what the program returns or displays.",
    "sample_question": "What is the difference between program input and program output?"
},
{
    "id": "string_basics",
    "title": "Strings",
    "summary": "Strings are sequences of characters used to store text. They support operations like concatenation and formatting.",
    "sample_question": "What is a string and how is it commonly used?"
},
{
    "id": "type_casting",
    "title": "Type Casting",
    "summary": "Type casting converts data from one type to another, such as from a string to a number. It helps ensure proper calculations and operations.",
    "sample_question": "What is type casting and when would you use it?"
},
{
    "id": "assignment",
    "title": "Assignment",
    "summary": "Assignment means storing a value inside a variable using the assignment operator (=). It updates or sets the variable's content.",
    "sample_question": "What does assignment mean in programming?"
},
{
    "id": "basic_syntax",
    "title": "Basic Syntax",
    "summary": "Syntax refers to the rules of writing valid code in a programming language, such as indentation, semicolons, and brackets.",
    "sample_question": "What is syntax in programming and why is it important?"
},
{
    "id": "debugging",
    "title": "Debugging",
    "summary": "Debugging is the process of finding and fixing errors in code. It often involves testing, printing values, and using debugging tools.",
    "sample_question": "What is debugging and why is it necessary?"
}

]

def load_content():
    """
    Checks if programming JSON exists. 
    If NO: Generates it from DEFAULT_CONTENT.
    If YES: Loads it.
    """
    try:
        path = os.path.join(os.path.dirname(__file__), CONTENT_FILE)
        
        # Check if file exists
        if not os.path.exists(path):
            logger.info(f"{CONTENT_FILE} not found. Generating study data...")
            with open(path, "w", encoding='utf-8') as f:
                json.dump(DEFAULT_CONTENT, f, indent=4)
            logger.info("Biology content file created successfully.")
            
        # Read the file
        with open(path, "r", encoding='utf-8') as f:
            data = json.load(f)
            return data
            
    except Exception as e:
        logger.error(f"Error managing content file: {e}")
        return []

# Load data immediately on startup
COURSE_CONTENT = load_content()


@dataclass
class TutorState:
    """Tracks the current learning context"""
    current_topic_id: str | None = None
    current_topic_data: dict | None = None
    mode: Literal["learn", "quiz", "teach_back"] = "learn"
    
    def set_topic(self, topic_id: str):
        topic = next((item for item in COURSE_CONTENT if item["id"] == topic_id), None)
        if topic:
            self.current_topic_id = topic_id
            self.current_topic_data = topic
            return True
        return False

@dataclass
class Userdata:
    tutor_state: TutorState
    agent_session: Optional[AgentSession] = None 


@function_tool
async def select_topic(
    ctx: RunContext[Userdata], 
    topic_id: Annotated[str, Field(description="The ID of the topic to study")]
) -> str:
    """Selects a topic to study from the available list."""
    state = ctx.userdata.tutor_state
    success = state.set_topic(topic_id.lower())
    
    if success:
        return f"Topic set to {state.current_topic_data['title']}. Ask the user if they want to 'Learn', be 'Quizzed', or 'Teach it back'."
    else:
        available = ", ".join([t["id"] for t in COURSE_CONTENT])
        return f"Topic not found. Available topics are: {available}"

@function_tool
async def set_learning_mode(
    ctx: RunContext[Userdata], 
    mode: Annotated[str, Field(description="The mode to switch to: 'learn', 'quiz', or 'teach_back'")]
) -> str:
    """Switches the interaction mode and updates the agent's voice/persona."""
    
    # 1. Update State
    state = ctx.userdata.tutor_state
    state.mode = mode.lower()
    
    # 2. Switch Voice based on Mode
    agent_session = ctx.userdata.agent_session 
    
    if agent_session:
        if state.mode == "learn":
            # MATTHEW: Learn Mode
            agent_session.tts.update_options(voice="en-US-matthew", style="Promo")
            instruction = f"Mode: LEARN. Explain: {state.current_topic_data['summary']}"
            
        elif state.mode == "quiz":
            # ALICIA: Quiz Mode
            agent_session.tts.update_options(voice="en-US-alicia", style="Conversational")
            instruction = f"Mode: QUIZ. Ask this question: {state.current_topic_data['sample_question']}"
            
        elif state.mode == "teach_back":
            # KEN: Teach Back Mode
            agent_session.tts.update_options(voice="en-US-ken", style="Promo")
            instruction = "Mode: TEACH_BACK. Ask the user to explain the concept to you as if YOU are the beginner."
        else:
            return "Invalid mode."
    else:
        instruction = "Voice switch failed (Session not found)."

    logger.info(f"SWITCHING MODE -> {state.mode.upper()}")
    return f"Switched to {state.mode} mode. {instruction}"

@function_tool
async def evaluate_teaching(
    ctx: RunContext[Userdata],
    user_explanation: Annotated[str, Field(description="The explanation given by the user during teach-back")]
) -> str:
    """call this when the user has finished explaining a concept in 'teach_back' mode."""
    logger.info(f"EVALUATING EXPLANATION: {user_explanation}")
    return "Analyze the user's explanation. Give them a score out of 10 on accuracy and clarity, and correct any mistakes."

# ======================================================
# 🧠 AGENT DEFINITION
# ======================================================

class TutorAgent(Agent):
    def __init__(self):
        # Generate list of topics for the prompt
        topic_list = ", ".join([f"{t['id']} ({t['title']})" for t in COURSE_CONTENT])
        
        super().__init__(
            instructions=f"""
            You are an Tutor designed to help users master fundamental programming concepts.
            
            📚 **AVAILABLE TOPICS:** {topic_list}
            
            🔄 **YOU HAVE 3 MODES:**
            1. **LEARN Mode (Voice: Matthew):** You explain the concept clearly using the summary data.
            2. **QUIZ Mode (Voice: Alicia):** You ask the user a specific question to test knowledge.
            3. **TEACH_BACK Mode (Voice: Ken):** YOU pretend to be a student. Ask the user to explain the concept to you.
            
            ⚙️ **BEHAVIOR:**
            - Start by asking what topic they want to study.
            - Use the `set_learning_mode` tool immediately when the user asks to learn, take a quiz, or teach.
            - In 'teach_back' mode, listen to their explanation and then use `evaluate_teaching` to give feedback.
            """,
            tools=[select_topic, set_learning_mode, evaluate_teaching],
        )


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}


    # 1. Initialize State
    userdata = Userdata(tutor_state=TutorState())

    # 2. Setup Agent
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-matthew", 
            style="Promo",        
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
        agent=TutorAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))