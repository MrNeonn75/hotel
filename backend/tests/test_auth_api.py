import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup_and_login_flow(client: AsyncClient):
    # 1. Signup
    signup_payload = {
        "firstName": "Murad",
        "lastName": "Həsənov",
        "email": "murad@example.com",
        "phone": "+994509998877",
        "password": "Password123",
    }
    res = await client.post("/api/v1/auth/signup", json=signup_payload)
    assert res.status_code == 201
    data = res.json()
    assert "user" in data
    assert "token" in data
    assert data["user"]["email"] == "murad@example.com"
    assert data["user"]["firstName"] == "Murad"
    token = data["token"]

    # 2. Duplicate email should fail
    dup_res = await client.post("/api/v1/auth/signup", json=signup_payload)
    assert dup_res.status_code == 409

    # 3. Login with correct password
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "murad@example.com", "password": "Password123"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["email"] == "murad@example.com"
    assert "token" in login_data

    # 4. Login with wrong password
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "murad@example.com", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

    # 5. Get current user profile with JWT
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "murad@example.com"
    assert me_data["firstName"] == "Murad"

    # 6. Update current user profile
    update_res = await client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"firstName": "Murad Bəy", "phone": "+994501112233"},
    )
    assert update_res.status_code == 200
    update_data = update_res.json()
    assert update_data["firstName"] == "Murad Bəy"
    assert update_data["phone"] == "+994501112233"

    # 7. Forgot password
    forgot_res = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "murad@example.com"},
    )
    assert forgot_res.status_code == 200
    assert forgot_res.json()["success"] is True

