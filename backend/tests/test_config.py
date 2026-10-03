from app.config import Settings


def test_cors_origins_parse_from_comma_separated_value():
    settings = Settings(CORS_ORIGINS=" http://localhost:3000/,https://hisabb.example.com ")

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://hisabb.example.com",
    ]


def test_cors_origins_default_to_local_frontend():
    assert Settings().cors_origins == ["http://localhost:3000"]
