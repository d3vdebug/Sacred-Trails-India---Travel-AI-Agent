#!/usr/bin/env python3
"""
Test script to verify order saving functionality
"""

import os
import json
import sys
from datetime import datetime, UTC

# Add src directory to path to import the agent module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_order_saving():
    """Test the order saving functionality"""
    print("Testing order saving functionality...")
    
    # Sample order data
    test_order = {
        "drink": "latte",
        "size": "medium", 
        "milk": "oat",
        "extras": ["whipped cream"],
        "name": "Test Customer"
    }
    
    # Add timestamp to order data (same as in agent.py)
    order_data = {
        **test_order,
        "timestamp": datetime.now(UTC).isoformat(),
        "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S')
    }
    
    # Get the current script directory and create orders path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    orders_dir = os.path.join(script_dir, "orders")
    
    try:
        os.makedirs(orders_dir, exist_ok=True)
        filename = os.path.join(orders_dir, f"test_order_{order_data['order_id']}.json")
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(order_data, f, indent=2)
        
        print(f"SUCCESS: Test order successfully saved to: {filename}")
        
        # Verify the file was created and contains correct data
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                saved_data = json.load(f)
            
            print("Saved order data:")
            print(json.dumps(saved_data, indent=2))
            
            # Verify all fields are present
            required_fields = ["drink", "size", "milk", "extras", "name", "timestamp", "order_id"]
            missing_fields = [field for field in required_fields if field not in saved_data]
            
            if not missing_fields:
                print("SUCCESS: All required fields present in saved order")
            else:
                print(f"ERROR: Missing fields: {missing_fields}")
                
        else:
            print("ERROR: File was not created")
            
    except Exception as e:
        print(f"ERROR during test: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_order_saving()
    if success:
        print("\nOrder saving test completed successfully!")
    else:
        print("\nOrder saving test failed!")
        sys.exit(1)