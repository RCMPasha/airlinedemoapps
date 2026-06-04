import requests, json, sys
url = 'http://localhost:8000/api/policy-files'
try:
    r = requests.get(url, timeout=5)
    r.raise_for_status()
    data = r.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print('Error:', e, file=sys.stderr)
