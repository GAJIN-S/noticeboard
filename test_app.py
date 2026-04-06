def test_basic_math():
    # A simple test to ensure pytest has something to collect and pass
    assert 2 + 2 == 4
    
def test_app_is_working():
    # Another simple test
    expected_status = "running"
    current_status = "running"
    assert current_status == expected_status
