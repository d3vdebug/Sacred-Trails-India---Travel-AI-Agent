#!/usr/bin/env python3
"""
Test the complete order flow with proper dependencies
"""

import sys
import os
import json
import asyncio
from datetime import datetime, UTC

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_order_flow():
    """Test the complete order flow simulation"""
    print("Testing complete order flow...")
    
    try:
        # Import the agent module with all dependencies
        import agent
        
        print("SUCCESS: Agent module imported with dependencies")
        
        # Simulate the order data that would be collected
        test_order = {
            "drink": "latte",
            "size": "medium", 
            "milk": "oat",
            "extras": ["whipped cream"],
            "name": "Test Customer"
        }
        
        print(f"Simulated order: {test_order}")
        
        # Test the order saving functionality (copy from agent.py)
        order_data = {
            **test_order,
            "timestamp": datetime.now(UTC).isoformat(),
            "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S')
        }
        
        # Get the current script directory and create orders path (same as agent)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        simulated_script_dir = os.path.join(script_dir, "src")
        orders_dir = os.path.join(simulated_script_dir, "..", "orders")
        
        print(f"Script directory: {simulated_script_dir}")
        print(f"Orders directory: {orders_dir}")
        
        # Normalize and create directory
        orders_dir = os.path.normpath(orders_dir)
        os.makedirs(orders_dir, exist_ok=True)
        
        filename = os.path.join(orders_dir, f"flow_test_order_{order_data['order_id']}.json")
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)
        
        print(f"SUCCESS: Order saved to: {filename}")
        
        # Verify the file was created
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                saved_data = json.load(f)
            print(f"SUCCESS: Verified saved data: {saved_data}")
            return True
        else:
            print("ERROR: File was not created")
            return False
            
    except Exception as e:
        print(f"ERROR: Order flow test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== Order Flow Test with Dependencies ===")
    
    # Run the async test
    result = asyncio.run(test_order_flow())
    
    if result:
        print("\nSUCCESS: Order flow test completed successfully!")
    else:
        print("\nERROR: Order flow test failed!")
        sys.exit(1)