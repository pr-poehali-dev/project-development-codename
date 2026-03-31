import json
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import (
    Encoding, PublicFormat, PrivateFormat, NoEncryption
)


def handler(event: dict, context) -> dict:
    """Генерация VAPID ключей в формате PKCS8"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': ''}

    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    # PKCS8 — именно этот формат ожидает pywebpush
    priv_pem = private_key.private_bytes(
        Encoding.PEM, PrivateFormat.PKCS8, NoEncryption()
    )

    pub_bytes = public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    pub_b64 = base64.urlsafe_b64encode(pub_bytes).rstrip(b'=').decode('utf-8')
    priv_b64 = base64.b64encode(priv_pem).decode('utf-8')

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'public_key': pub_b64,
            'private_key_b64': priv_b64,
            'pem_preview': priv_pem.decode('utf-8')[:60]
        })
    }
