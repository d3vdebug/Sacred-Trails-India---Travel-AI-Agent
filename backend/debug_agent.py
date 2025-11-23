#!/usr/bin/env python3
"""
Debug script to test the agent with logging enabled
"""

import logging
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('agent_debug.log')
    ]
)

def test_logging():
    """Test if logging is working"""
    logger = logging.getLogger("agent")
    logger.info("Testing logging functionality...")
    print("DEBUG: Logging test message")
    return True

if __name__ == "__main__":
    print("=== Agent Debug Test ===")
    test_logging()
    print("If you see this message and the log file, logging is working.")