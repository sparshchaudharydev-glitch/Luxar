import io

import qrcode


def generate_restaurant_qr(url: str) -> io.BytesIO:
    buffer = io.BytesIO()
    qrcode.make(url).save(buffer, format="PNG")
    buffer.seek(0)
    return buffer