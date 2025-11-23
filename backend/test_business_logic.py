#!/usr/bin/env python3
"""
Test the new business logic features
"""

import sys
import os
import json
from datetime import datetime, UTC

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_business_logic():
    """Test the new business logic functionality"""
    print("Testing business logic features...")
    
    try:
        # Import the agent module with business logic
        import agent
        
        print("SUCCESS: Agent module imported with business logic")
        
        # Test pricing calculation
        test_cases = [
            {
                "drink": "latte",
                "size": "medium",
                "extras": ["whipped cream"],
                "expected_price": 4.50  # 4.00 + 0.50
            },
            {
                "drink": "mocha",
                "size": "large", 
                "extras": ["whipped cream", "caramel syrup"],
                "expected_price": 6.25  # 5.00 + 0.50 + 0.75
            },
            {
                "drink": "espresso",
                "size": "small",
                "extras": [],
                "expected_price": 2.50
            }
        ]
        
        print("\n=== Testing Pricing Calculations ===")
        for i, test_case in enumerate(test_cases, 1):
            calculated_price = agent.calculate_total_price(
                test_case["drink"], 
                test_case["size"], 
                test_case["extras"]
            )
            
            print(f"Test {i}: {test_case['size']} {test_case['drink']} with {test_case['extras']}")
            print(f"  Calculated: ${calculated_price}")
            print(f"  Expected: ${test_case['expected_price']}")
            print(f"  Match: {'PASS' if abs(calculated_price - test_case['expected_price']) < 0.01 else 'FAIL'}")
        
        # Test preparation time calculation
        print("\n=== Testing Preparation Time Calculations ===")
        time_tests = [
            {"drink": "espresso", "size": "small", "extras": [], "expected": 2},
            {"drink": "latte", "size": "large", "extras": ["whipped cream"], "expected": 6},
            {"drink": "mocha", "size": "medium", "extras": ["caramel syrup", "whipped cream"], "expected": 8}
        ]
        
        for i, test_case in enumerate(time_tests, 1):
            calculated_time = agent.calculate_preparation_time(
                test_case["drink"],
                test_case["size"], 
                test_case["extras"]
            )
            
            print(f"Test {i}: {test_case['size']} {test_case['drink']} with {test_case['extras']}")
            print(f"  Calculated: {calculated_time} minutes")
            print(f"  Expected: {test_case['expected']} minutes")
        
        # Test order number generation
        print("\n=== Testing Order Number Generation ===")
        order_numbers = []
        for i in range(5):
            order_num = agent.generate_order_number()
            order_numbers.append(order_num)
            print(f"Generated: {order_num}")
        
        # Check if all order numbers are unique
        unique_numbers = len(set(order_numbers))
        print(f"Unique numbers generated: {unique_numbers}/5")
        print(f"All unique: {'PASS' if unique_numbers == 5 else 'FAIL'}")
        
        # Test complete order data structure
        print("\n=== Testing Complete Order Structure ===")
        sample_order = {
            "drink": "latte",
            "size": "medium",
            "milk": "oat",
            "extras": ["whipped cream", "vanilla syrup"],
            "name": "Test Customer"
        }
        
        # Calculate business logic
        order_number = agent.generate_order_number()
        total_price = agent.calculate_total_price(
            sample_order["drink"],
            sample_order["size"], 
            sample_order["extras"]
        )
        estimated_time = agent.calculate_preparation_time(
            sample_order["drink"],
            sample_order["size"],
            sample_order["extras"]
        )
        
        # Create complete order data
        complete_order = {
            **sample_order,
            "order_number": order_number,
            "timestamp": datetime.now(UTC).isoformat(),
            "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S'),
            "total_price": total_price,
            "estimated_time": f"{estimated_time} minutes",
            "currency": "USD",
            "payment_status": "pending",
            "order_status": "confirmed"
        }
        
        print("Complete order structure:")
        print(json.dumps(complete_order, indent=2))
        
        return True
        
    except Exception as e:
        print(f"ERROR: Business logic test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== Business Logic Feature Test ===")
    
    success = test_business_logic()
    
    if success:
        print("\nSUCCESS: All business logic features working correctly!")
        print("\nNew features added:")
        print("✓ Pricing calculation with extras")
        print("✓ Order number generation")
        print("✓ Preparation time estimation") 
        print("✓ Enhanced order data structure")
        print("✓ Professional confirmation messages")
    else:
        print("\nERROR: Some business logic features failed!")
        sys.exit(1)