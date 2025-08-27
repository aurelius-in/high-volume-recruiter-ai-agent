import hashlib, json

def compute_hash(ts, payload, secret, prev=None):
    body = json.dumps(payload, sort_keys=True)
    return hashlib.sha256((str(ts) + body + (prev or "") + secret).encode()).hexdigest()

def test_chain_hash_changes_with_prev():
    h1 = compute_hash(1.0, {"a":1}, "s")
    h2 = compute_hash(2.0, {"b":2}, "s", prev=h1)
    assert h1 != h2


