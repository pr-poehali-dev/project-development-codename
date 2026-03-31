import json
import base64
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption


def handler(event: dict, context) -> dict:
    """Генерация новой пары VAPID ключей"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': ''}

    v = Vapid()
    v.generate_keys()

    pub_bytes = v.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    public_key = base64.urlsafe_b64encode(pub_bytes).rstrip(b'=').decode('utf-8')

    priv_bytes = v.private_key.private_bytes(Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption())
    private_key = base64.urlsafe_b64encode(priv_bytes).rstrip(b'=').decode('utf-8')

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'public_key': public_key, 'private_key': private_key})
    }
