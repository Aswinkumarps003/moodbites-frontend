import io
import requests
import pytesseract
from PIL import Image, ImageEnhance
try:
    from pdf2image import convert_from_bytes
    _PDF2IMAGE = True
except Exception:
    _PDF2IMAGE = False

# --- Configuration ---
# If Tesseract is not in your system's PATH, you must specify the path here.
# For Windows, it might be:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def _preprocess(img: Image.Image) -> Image.Image:
    """
    Basic preprocessing to improve OCR results.
    """
    # Convert to grayscale and boost contrast
    img = img.convert('L')
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2)
    return img


def _extract_text_from_image(img: Image.Image) -> str:
    img = _preprocess(img)
    return pytesseract.image_to_string(img)


def validate_with_tesseract(user_name, certificate_image_path):
    """
    Validates a dietitian's certificate using Tesseract OCR.

    Args:
        user_name (str): The full name entered by the user.
        certificate_image_path (str): The path to the uploaded certificate image.

    Returns:
        dict: A dictionary containing the validation status and extracted text.
    """
    try:
        # Load and OCR
        img = Image.open(certificate_image_path)
        extracted_text = _extract_text_from_image(img)
        
        # For debugging, you can print the raw text
        # print("--- Extracted Text ---")
        # print(extracted_text)
        # print("----------------------")

        # --- Step 4: Validation Logic ---
        text_to_check = extracted_text.lower()

        # Name Validation
        name_found = user_name.lower() in text_to_check
        if not name_found:
            return {"success": False, "reason": f"Name '{user_name}' not found.", "text": extracted_text}

        # Keyword Validation
        required_keywords = ["diet", "dietitian", "health coach", "nutritionist"]
        keyword_found = any(keyword in text_to_check for keyword in required_keywords)
        if not keyword_found:
            return {"success": False, "reason": "Required keywords not found.", "text": extracted_text}

        # --- Step 5: Decision ---
        return {"success": True, "reason": "Validation successful.", "text": extracted_text}

    except FileNotFoundError:
        return {"success": False, "reason": "Certificate file not found.", "text": ""}
    except Exception as e:
        return {"success": False, "reason": f"An error occurred: {e}", "text": ""}


def validate_cert_by_url(user_name: str, certificate_url: str):
    """
    Downloads a certificate from Cloudinary (or any URL), runs OCR, and validates that
    - the user's name appears in the document; and
    - one of the required role keywords appears in the document.

    Supports images; supports PDFs if pdf2image is available.
    """
    try:
        resp = requests.get(certificate_url, timeout=30)
        resp.raise_for_status()

        content_type = resp.headers.get('Content-Type', '').lower()
        data = resp.content

        if 'pdf' in content_type or certificate_url.lower().endswith('.pdf'):
            if not _PDF2IMAGE:
                return {"success": False, "reason": "PDF support not available (pdf2image not installed).", "text": ""}
            # Convert first page of PDF to image for OCR
            pages = convert_from_bytes(data, dpi=300)
            if not pages:
                return {"success": False, "reason": "Unable to read PDF pages.", "text": ""}
            img = pages[0]
            extracted_text = _extract_text_from_image(img)
        else:
            # Treat as image
            img = Image.open(io.BytesIO(data))
            extracted_text = _extract_text_from_image(img)

        text_to_check = extracted_text.lower()
        name_found = user_name.lower() in text_to_check
        if not name_found:
            return {"success": False, "reason": f"Name '{user_name}' not found.", "text": extracted_text}

        required_keywords = ["diet", "dietitian", "health coach", "nutritionist"]
        keyword_found = any(keyword in text_to_check for keyword in required_keywords)
        if not keyword_found:
            return {"success": False, "reason": "Required keywords not found.", "text": extracted_text}

        return {"success": True, "reason": "Validation successful.", "text": extracted_text}
    except requests.RequestException as re:
        return {"success": False, "reason": f"Failed to download certificate: {re}", "text": ""}
    except Exception as e:
        return {"success": False, "reason": f"An error occurred: {e}", "text": ""}


# --- Example Usage ---
if __name__ == "__main__":
    # Option A: Validate from a local file path (image)
    # result = validate_with_tesseract("Jane Doe", "path/to/certificate.png")

    # Option B: Validate directly from Cloudinary URL
    # result = validate_cert_by_url("Jane Doe", "https://res.cloudinary.com/your-cloud/.../certificate.pdf")

    # print(result)
    pass