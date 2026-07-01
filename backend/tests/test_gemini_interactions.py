from app.providers.gemini_interactions import extract_output_text, parse_json_output


def test_extract_output_text_from_output_text_field():
    data = {"output_text": "hello world"}
    assert extract_output_text(data) == "hello world"


def test_extract_output_text_from_steps():
    data = {
        "steps": [
            {
                "type": "model_output",
                "content": [{"type": "text", "text": '{"device_category":"router"}'}],
            }
        ]
    }
    assert extract_output_text(data) == '{"device_category":"router"}'


def test_parse_json_output_strips_fences():
    data = {
        "output_text": '```json\n{"ocr_text":"E24","device_category":"dishwasher"}\n```'
    }
    parsed = parse_json_output(data)
    assert parsed["ocr_text"] == "E24"
    assert parsed["device_category"] == "dishwasher"
