from app.manuals.indexer import get_global_index
from app.manuals.retriever import build_query_text, retrieve_chunks


def _top_ids(query, **kwargs):
    index = get_global_index()
    results = retrieve_chunks(index, query, top_k=3, **kwargs)
    return [rc.chunk["id"] for rc in results]


def test_router_red_led_query_returns_tp_link_chunk_in_top3():
    query = build_query_text("red internet light", "router", "TP-Link", "AX55", None, None)
    top_ids = _top_ids(query, category="router", brand="TP-Link", model="AX55")
    assert "router_tp_link_archer_ax55#understanding-the-internet-led" in top_ids


def test_e24_error_code_returns_bosch_chunk_in_top3():
    query = build_query_text("E24 drain error", "dishwasher", "Bosch", None, "E24", None)
    top_ids = _top_ids(query, category="dishwasher", brand="Bosch", error_code="E24")
    assert "dishwasher_bosch_e24#what-the-e24-error-means" in top_ids


def test_oe_error_code_returns_lg_chunk_in_top3():
    query = build_query_text("OE drain error", "washing_machine", "LG", None, "OE", None)
    top_ids = _top_ids(query, category="washing_machine", brand="LG", error_code="OE")
    assert "washing_machine_lg_oe#what-the-oe-error-means" in top_ids


def test_microwave_capacitor_query_returns_safety_chunk_in_top3():
    query = build_query_text("microwave capacitor high voltage danger", "dangerous", None, None, None, None)
    top_ids = _top_ids(query, category="dangerous", prefer_safety=True)
    assert "safety_high_risk_repairs#microwave-capacitor" in top_ids


def test_empty_query_returns_no_results():
    index = get_global_index()
    results = retrieve_chunks(index, "", top_k=3)
    assert results == []
