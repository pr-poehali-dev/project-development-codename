import json
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import (
    Encoding, PublicFormat, PrivateFormat, NoEncryption
)


def handler(event: dict, context) -> dict:
    """Генерация VAPID ключей"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': ''}

    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    priv_pem = private_key.private_bytes(
        Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption()
    )

    # Публичный ключ в uncompressed point base64url
    pub_bytes = public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    pub_b64 = base64.urlsafe_b64encode(pub_bytes).rstrip(b'=').decode('utf-8')

    # Приватный ключ — PEM в стандартном base64 (не urlsafe) для хранения в секрете
    priv_b64 = base64.b64encode(priv_pem).decode('utf-8')

    # Проверка длины
    pem_str = priv_pem.decode('utf-8')

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'public_key': pub_b64,
            'private_key_b64': priv_b64,
            'private_key_pem_len': len(pem_str),
            'private_key_pem_preview': pem_str[:50]
        })
    }
