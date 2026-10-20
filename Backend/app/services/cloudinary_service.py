import cloudinary.uploader


def destroy_image(public_id: str | None) -> None:
    """Deletes an image from Cloudinary. A failed delete doesn't undo a database change."""
    if not public_id:
        return
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass