
from io import BytesIO

import qrcode


def generate_restaurant_qr(restaurant_url: str) -> BytesIO:
    """Generate a PNG QR code for a restaurant's public page."""

    qr = qrcode.QRCode(
        version=None,
        box_size=10,
        border=4,
    )

    qr.add_data(restaurant_url)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    output = BytesIO()
    image.save(output, format="PNG")
    output.seek(0)

    return output
