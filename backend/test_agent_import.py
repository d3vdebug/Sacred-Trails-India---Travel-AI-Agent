#!/usr/bin/env python3
"""
Test to check if agent module can be imported and basic structure is correct
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_agent_import():
    """Test importing the agent module"""
    try:
        print("Testing agent import...")
        
        # Import the agent module
        import agent
        
        print("SUCCESS: Agent module imported successfully")
        
        # Check if key functions exist
        if hasattr(agent, 'entrypoint'):
            print("SUCCESS: entrypoint function found")
        else:
            print("ERROR: entrypoint function not found")
            
        if hasattr(agent, 'BaristaAgent'):
            print("SUCCESS: BaristaAgent class found")
        else:
            print("ERROR: BaristaAgent class not found")
            
        if hasattr(agent, 'prewarm'):
            print("SUCCESS: prewarm function found")
        else:
            print("ERROR: prewarm function not found")
            
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to import agent module: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_basic_functionality():
    """Test basic agent functionality without running the full agent"""
    try:
        print("\nTesting basic functionality...")
        
        # Import the agent module
        import agent
        
        # Test creating an instance of BaristaAgent
        barista = agent.BaristaAgent()
        print("SUCCESS: BaristaAgent instance created")
        
        # Check the instructions
        if barista.instructions:
            print("SUCCESS: Instructions found")
            print(f"Instructions preview: {barista.instructions[:100]}...")
        else:
            print("ERROR: No instructions found")
            
        return True
        
    except Exception as e:
        print(f"ERROR: Failed basic functionality test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== Agent Import and Basic Functionality Test ===")
    
    success1 = test_agent_import()
    success2 = test_basic_functionality()
    
    if success1 and success2:
        print("\nSUCCESS: All tests passed! Agent module is working correctly.")
    else:
        print("\nERROR: Some tests failed!")
        sys.exit(1)