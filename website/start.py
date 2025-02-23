import select
import subprocess
import signal
import sys
import time
import platform
import threading

def launch_node_server(max_memory_mb):
    # Use shell=True on Windows to handle process creation properly
    if platform.system() == 'Windows':
        process = subprocess.Popen(
            f'node --max-old-space-size={max_memory_mb} server.cjs',
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE,
            bufsize=1,
            universal_newlines=True
        )
    else:
        process = subprocess.Popen(
            ['node', f'--max-old-space-size={max_memory_mb}', 'server.cjs'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE,
            bufsize=1,
            universal_newlines=True
        )
    return process

def output_reader(pipe, prefix=''):
    """Read output from pipe and print it with optional prefix"""
    for line in iter(pipe.readline, ''):
        print(f"{prefix}{line}", end='', flush=True)

def sigint_handler(signum, frame):
    global should_run
    if node_process:
        print("\nShutting down Node.js process...")
        if platform.system() == 'Windows':
            node_process.terminate()
        else:
            node_process.send_signal(signal.SIGINT)
        # Wait for the process to finish
        node_process.wait()
    should_run = False
    sys.exit(0)

if __name__ == "__main__":
    # Configuration
    node_max_mem = 4096  # Memory limit in MB
    should_run = True

    signal.signal(signal.SIGINT, sigint_handler)
    node_process = None

    while should_run:
        try:
            node_process = launch_node_server(node_max_mem)

            # Start output reader threads
            stdout_thread = threading.Thread(
                target=output_reader,
                args=(node_process.stdout,)
            )
            stderr_thread = threading.Thread(
                target=output_reader,
                args=(node_process.stderr, 'ERROR: ')
            )

            stdout_thread.daemon = True
            stderr_thread.daemon = True
            stdout_thread.start()
            stderr_thread.start()

            # Forward stdin to the Node process
            while should_run:
                try:
                    # Check if process is still running
                    if node_process.poll() is not None:
                        return_code = node_process.returncode
                        if return_code == 0:
                            print("Node.js server stopped normally")
                            should_run = False
                            break
                        else:
                            print(f"Node.js server crashed with code {return_code}, restarting in 3 seconds...")
                            time.sleep(3)
                            break

                    # Forward any input to Node process
                    if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
                        line = sys.stdin.readline()
                        if line:
                            node_process.stdin.write(line)
                            node_process.stdin.flush()

                except Exception as e:
                    print(f"Error in input forwarding: {e}")
                    break

            # Wait for output threads to finish
            stdout_thread.join(timeout=1)
            stderr_thread.join(timeout=1)

        except Exception as e:
            print(f"Error occurred: {e}")
            time.sleep(3)

    print("Script terminated")
