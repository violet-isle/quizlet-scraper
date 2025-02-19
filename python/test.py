import sys, json, struct
message = json.dumps({"text": "Test message"}).encode("utf-8")
sys.stdout.buffer.write(struct.pack("I", len(message)) + message)
sys.stdout.buffer.flush()
