#!/usr/bin/env python3
"""
Debug script to test agent execution exactly as it would be run in production
"""

import sys
import os
import subprocess
import time

def test_agent_startup():
    """Test if the agent can start without errors"""
    print("Testing agent startup...")
    
    # Change to backend directory (same as start_app.sh)
    backend_dir = os.path.join(os.path.dirname(__file__))
    print(f"Backend directory: {backend_dir}")
    
    # Test the exact command used in start_app.sh
    cmd = ["uv", "run", "python", "src/agent.py", "dev"]
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Run the agent with a timeout to see if it starts
        print("Starting agent process...")
        process = subprocess.Popen(
            cmd,
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Wait a few seconds to see if it starts properly
        print("Waiting for agent to initialize...")
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("SUCCESS: Agent process is running")
            
            # Try to get some output
            try:
                # Non-blocking read
                import select
                if select.select([process.stdout], [], [], 0)[0]:
                    output = process.stdout.readline()
                    print(f"Agent output: {output}")
            except:
                print("Could not read agent output")
                
            # Terminate the process
            print("Terminating test process...")
            process.terminate()
            process.wait(timeout=5)
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"ERROR: Agent process failed to start")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
            
    except Exception as e:
        print(f"ERROR: Failed to start agent: {e}")
        return False

def test_import_issues():
    """Test if there are any import issues"""
    print("\nTesting imports...")
    
    backend_dir = os.path.join(os.path.dirname(__file__))
    cmd = ["uv", "run", "python", "-c", "import sys; sys.path.insert(0, 'src'); import agent; print('Import successful')"]
    
    try:
        result = subprocess.run(cmd, cwd=backend_dir, capture_output=True, text=True, timeout=10)
        print(f"Import test result: {result.returncode}")
        if result.stdout:
            print(f"STDOUT: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"ERROR: Import test failed: {e}")
        return False

def check_dependencies():
    """Check if all required dependencies are available"""
    print("\nChecking dependencies...")
    
    backend_dir = os.path.join(os.path.dirname(__file__))
    cmd = ["uv", "run", "python", "-c", """
try:
    from livekit.plugins import murf, deepgram, google, silero, noise_cancellation
    from livekit.plugins.turn_detector.multilingual import MultilingualModel
    print('All dependencies available')
except ImportError as e:
    print(f'Missing dependency: {e}')
    sys.exit(1)
"""]
    
    try:
        result = subprocess.run(cmd, cwd=backend_dir, capture_output=True, text=True, timeout=10)
        print(f"Dependencies check: {result.returncode}")
        if result.stdout:
            print(f"STDOUT: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"ERROR: Dependencies check failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Agent Production Environment Test ===")
    
    dep_check = check_dependencies()
    import_check = test_import_issues()
    startup_check = test_agent_startup()
    
    print(f"\n=== Results ===")
    print(f"Dependencies check: {'PASS' if dep_check else 'FAIL'}")
    print(f"Import check: {'PASS' if import_check else 'FAIL'}")
    print(f"Startup check: {'PASS' if startup_check else 'FAIL'}")
    
    if dep_check and import_check and startup_check:
        print("\nSUCCESS: All tests passed! Agent should work in production.")
    else:
        print("\nERROR: Some tests failed. Check the output above.")
        sys.exit(1)