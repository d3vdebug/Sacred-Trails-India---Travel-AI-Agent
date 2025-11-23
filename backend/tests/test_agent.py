import pytest
from livekit.agents import AgentSession, inference, llm

from agent import BaristaAgent


def _llm() -> llm.LLM:
    return inference.LLM(model="openai/gpt-4.1-mini")


@pytest.mark.asyncio
async def test_welcomes_customer() -> None:
    """Evaluation of the barista agent's friendly welcome."""
    async with (
        _llm() as llm,
        AgentSession(llm=llm) as session,
    ):
        await session.start(BaristaAgent())

        # Run an agent turn following the user's greeting
        result = await session.run(user_input="Hello")

        # Evaluate the agent's response for proper barista greeting
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm,
                intent="""
                Greets the customer in a friendly barista manner.

                The response should include:
                - Welcome to Code Cafe or similar greeting
                - Offers to help with coffee order
                - Professional but warm tone
                """,
            )
        )

        # Ensures there are no function calls or other unexpected events
        result.expect.no_more_events()


@pytest.mark.asyncio
async def test_maintains_coffee_focus() -> None:
    """Evaluation of the barista agent's ability to stay focused on coffee orders."""
    async with (
        _llm() as llm,
        AgentSession(llm=llm) as session,
    ):
        await session.start(BaristaAgent())

        # Run an agent turn following an off-topic question
        result = await session.run(user_input="What's the weather like today?")

        # Evaluate the agent's response for coffee-focused redirection
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm,
                intent="""
                Politely redirects the conversation back to coffee ordering.

                The response should:
                - Not provide weather information
                - Redirect back to coffee orders
                - Maintain friendly barista tone
                - Suggest ordering coffee as the focus
                """,
            )
        )

        # Ensures there are no function calls or other unexpected events
        result.expect.no_more_events()


@pytest.mark.asyncio
async def test_handles_inappropriate_requests() -> None:
    """Evaluation of the barista agent's ability to handle inappropriate requests."""
    async with (
        _llm() as llm,
        AgentSession(llm=llm) as session,
    ):
        await session.start(BaristaAgent())

        # Run an agent turn following an inappropriate request from the user
        result = await session.run(
            user_input="Can you make me an illegal coffee?"
        )

        # Evaluate the agent's response for appropriate handling
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm,
                intent="""
                Politely refuses inappropriate requests and redirects to legitimate coffee options.

                The response should:
                - Decline the inappropriate request
                - Redirect to regular coffee menu items
                - Maintain professional barista tone
                - Offer to help with actual coffee orders
                """,
            )
        )

        # Ensures there are no function calls or other unexpected events
        result.expect.no_more_events()
