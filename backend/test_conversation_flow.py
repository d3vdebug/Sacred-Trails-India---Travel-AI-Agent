#!/usr/bin/env python3
"""
Test to simulate a complete conversation flow and identify where it fails
"""

import sys
import os
import json
import tempfile
import shutil
from datetime import datetime, UTC
from unittest.mock import Mock, AsyncMock, patch

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_order_collection_simulation():
    """Simulate the order collection process without actually running the agent"""
    print("Testing order collection simulation...")
    
    try:
        # Import dependencies
        from livekit.agents import AgentSession, JobContext, JobProcess
        from livekit.plugins import murf, deepgram, google, silero, noise_cancellation
        from livekit.plugins.turn_detector.multilingual import MultilingualModel
        from livekit.agents import tokenize
        
        print("SUCCESS: All dependencies imported")
        
        # Test the exact order data structure that would be collected
        test_order = {
            "drink": "latte",
            "size": "medium", 
            "milk": "oat",
            "extras": ["whipped cream"],
            "name": "Test Customer"
        }
        
        print(f"Test order data: {test_order}")
        
        # Test the order saving logic (copy from agent.py)
        order_data = {
            **test_order,
            "timestamp": datetime.now(UTC).isoformat(),
            "order_id": datetime.now(UTC).strftime('%Y%m%dT%H%M%S')
        }
        
        # Test path resolution in different scenarios
        scenarios = [
            ("From backend dir", os.path.join(os.path.dirname(__file__))),
            ("From src dir", os.path.join(os.path.dirname(__file__), 'src')),
            ("From project root", os.path.join(os.path.dirname(__file__), '..'))
        ]
        
        for scenario_name, base_dir in scenarios:
            print(f"\n--- Testing {scenario_name} ---")
            print(f"Base directory: {base_dir}")
            
            if scenario_name == "From backend dir":
                script_dir = os.path.join(base_dir, "src")
            elif scenario_name == "From src dir":
                script_dir = base_dir
            else:
                script_dir = os.path.join(base_dir, "backend", "src")
                
            orders_dir = os.path.join(script_dir, "..", "orders")
            orders_dir = os.path.normpath(orders_dir)
            
            print(f"Script directory: {script_dir}")
            print(f"Orders directory: {orders_dir}")
            print(f"Orders directory exists: {os.path.exists(orders_dir)}")
            
            # Create directory if needed
            try:
                os.makedirs(orders_dir, exist_ok=True)
                print("SUCCESS: Created/verified orders directory")
                
                # Test file creation
                filename = os.path.join(orders_dir, f"scenario_test_{scenario_name.replace(' ', '_')}_{order_data['order_id']}.json")
                print(f"Full file path: {filename}")
                
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(order_data, f, indent=2)
                
                if os.path.exists(filename):
                    print("SUCCESS: File created successfully")
                    
                    # Verify content
                    with open(filename, "r", encoding="utf-8") as f:
                        saved_data = json.load(f)
                    print(f"SUCCESS: Content verified: {saved_data}")
                    
                else:
                    print("ERROR: File was not created")
                    
            except Exception as e:
                print(f"ERROR: {e}")
                
        return True
        
    except Exception as e:
        print(f"ERROR: Order collection simulation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_potential_issues():
    """Test potential issues that could prevent order saving"""
    print("\n=== Testing Potential Issues ===")
    
    issues = []
    
    # Check directory permissions
    orders_dir = os.path.join(os.path.dirname(__file__), "orders")
    if not os.access(orders_dir, os.W_OK):
        issues.append("Orders directory is not writable")
    
    # Check if there are any existing order files
    try:
        order_files = [f for f in os.listdir(orders_dir) if f.startswith("order_") and f.endswith(".json")]
        print(f"Found {len(order_files)} existing order files")
        if order_files:
            print(f"Latest order file: {max(order_files)}")
    except Exception as e:
        issues.append(f"Cannot read orders directory: {e}")
    
    # Check for any recent agent processes
    try:
        import psutil
        agent_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['cmdline'] and any('agent.py' in arg for arg in proc.info['cmdline']):
                    agent_processes.append(proc)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        print(f"Found {len(agent_processes)} running agent processes")
        if agent_processes:
            for proc in agent_processes:
                print(f"  - PID {proc.pid}: {proc.cmdline()}")
                
    except ImportError:
        print("psutil not available, skipping process check")
    except Exception as e:
        issues.append(f"Cannot check processes: {e}")
    
    # Report issues
    if issues:
        print("\nPOTENTIAL ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\nNo obvious issues detected")
    
    return len(issues) == 0

if __name__ == "__main__":
    print("=== Complete Order Flow Debug Test ===")
    
    simulation_success = test_order_collection_simulation()
    no_issues = test_potential_issues()
    
    print(f"\n=== Final Results ===")
    print(f"Order collection simulation: {'PASS' if simulation_success else 'FAIL'}")
    print(f"No issues detected: {'PASS' if no_issues else 'FAIL'}")
    
    if simulation_success and no_issues:
        print("\nSUCCESS: Order saving should work. The issue might be:")
        print("1. Agent crashes during actual conversation")
        print("2. Customer doesn't complete the full order")
        print("3. Network/API issues during the call")
        print("4. The agent exits early due to timeout or error")
    else:
        print("\nERROR: Issues detected that could prevent order saving")