#!/usr/bin/env python3
"""
Test to simulate agent execution and debug order saving
"""

import os
import sys
import json
from datetime import datetime, UTC

def test_agent_order_saving():
    """Test order saving exactly as the agent would do it"""
    print("Testing agent order saving simulation...")
    
    # Simulate the same order data structure as the agent
    test_order = {
        "drink": "latte",
        "size": "medium", 
        "milk": "oat",
        "extras": ["whipped cream", "caramel syrup"],
        "name": "Debug Test Customer"
    }
    
    # Add timestamp to order data (same as in agent.py)
    order_data = {
        **test_order,
        "timestamp": datetime.now(UTC).isoformat(),
        "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S')
    }
    
    print(f"Order data: {order_data}")
    
    # Get the current script directory and create orders path (same as agent)
    # Since we're running this from backend/, simulate the agent's __file__ path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # For this test, simulate the agent being in src/ directory
    simulated_script_dir = os.path.join(script_dir, "src")
    orders_dir = os.path.join(simulated_script_dir, "..", "orders")
    
    print(f"Simulated script directory: {simulated_script_dir}")
    print(f"Orders directory: {orders_dir}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Orders directory exists: {os.path.exists(orders_dir)}")
    
    # Normalize the path to handle .. properly
    orders_dir = os.path.normpath(orders_dir)
    print(f"Normalized orders directory: {orders_dir}")
    print(f"Normalized orders directory exists: {os.path.exists(orders_dir)}")
    
    try:
        os.makedirs(orders_dir, exist_ok=True)
        print(f"Created/verified orders directory: {orders_dir}")
        
        filename = os.path.join(orders_dir, f"agent_test_order_{order_data['order_id']}.json")
        print(f"Full file path: {filename}")
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)
        
        print(f"SUCCESS: Order saved to: {filename}")
        
        # Verify file was created
        if os.path.exists(filename):
            print("SUCCESS: File exists after writing")
            with open(filename, "r", encoding="utf-8") as f:
                saved_data = json.load(f)
            print(f"Saved data: {saved_data}")
        else:
            print("ERROR: File does not exist after writing")
            
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to save order: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_alternative_path():
    """Test with absolute path from project root"""
    print("\nTesting with absolute path...")
    
    # Get the project root directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)  # Go up one level from backend
    orders_dir = os.path.join(project_root, "backend", "orders")
    
    print(f"Project root: {project_root}")
    print(f"Orders directory (absolute): {orders_dir}")
    
    test_order = {
        "drink": "espresso",
        "size": "large",
        "milk": "regular", 
        "extras": [],
        "name": "Absolute Path Test"
    }
    
    order_data = {
        **test_order,
        "timestamp": datetime.now(UTC).isoformat(),
        "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S')
    }
    
    try:
        os.makedirs(orders_dir, exist_ok=True)
        filename = os.path.join(orders_dir, f"absolute_path_test_{order_data['order_id']}.json")
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)
        
        print(f"SUCCESS: Order saved to: {filename}")
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    print("=== Agent Order Saving Debug Test ===")
    
    success1 = test_agent_order_saving()
    success2 = test_alternative_path()
    
    if success1 and success2:
        print("\nSUCCESS: All tests passed!")
    else:
        print("\nERROR: Some tests failed!")
        sys.exit(1)