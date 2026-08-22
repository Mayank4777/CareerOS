import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None and isinstance(data, dict):
        data_bytes = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    elif data is not None and isinstance(data, bytes):
        data_bytes = data
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed_body = json.loads(body)
        except Exception:
            parsed_body = body
        return e.code, parsed_body

def extract_token(auth_response):
    if not isinstance(auth_response, dict):
        return None
    if "access" in auth_response:
        return auth_response["access"]
    if "data" in auth_response and isinstance(auth_response["data"], dict):
        return auth_response["data"].get("access")
    if "tokens" in auth_response and isinstance(auth_response["tokens"], dict):
        return auth_response["tokens"].get("access")
    return None

def main():
    print("=== STARTING STAGING REAL HTTP SMOKE TESTS ===")

    timestamp = int(time.time())
    user_a_email = f"staging_usera_{timestamp}@example.com"
    user_b_email = f"staging_userb_{timestamp}@example.com"
    password = "StagingTestPass123!Secure"

    # 1. AUTHENTICATION
    print("\n--- 1. AUTHENTICATION ---")
    status, res_a = make_request(f"{BASE_URL}/auth/register/", "POST", {
        "email": user_a_email,
        "password": password,
        "confirm_password": password,
        "first_name": "User",
        "last_name": "A"
    })
    print(f"User A Register: Status {status}")

    status, auth_a = make_request(f"{BASE_URL}/auth/login/", "POST", {
        "email": user_a_email,
        "password": password
    })
    print(f"User A Login: Status {status}")
    token_a = extract_token(auth_a)
    print(f"User A Token extracted: {bool(token_a)}")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    status, res_b = make_request(f"{BASE_URL}/auth/register/", "POST", {
        "email": user_b_email,
        "password": password,
        "confirm_password": password,
        "first_name": "User",
        "last_name": "B"
    })
    status, auth_b = make_request(f"{BASE_URL}/auth/login/", "POST", {
        "email": user_b_email,
        "password": password
    })
    print(f"User B Login: Status {status}")
    token_b = extract_token(auth_b)
    print(f"User B Token extracted: {bool(token_b)}")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. SAVED JOBS
    print("\n--- 2. SAVED JOBS FLOW ---")
    status, jobs_list = make_request(f"{BASE_URL}/jobs/", "GET", headers=headers_a)
    print(f"GET Jobs: Status {status}")

    status, new_job = make_request(f"{BASE_URL}/jobs/", "POST", {
        "title": "Senior Python Backend Architect",
        "company": "Tech Corp Inc",
        "description": "Building high-performance Django API endpoints and cloud microservices with PostgreSQL and Redis.",
        "location": "Remote",
        "requirements": ["Python", "Django", "PostgreSQL", "Docker", "REST API"]
    }, headers=headers_a)
    job_data = new_job.get("data") if isinstance(new_job.get("data"), dict) else new_job
    job_id_a = job_data.get("id") if isinstance(job_data, dict) else None
    print(f"POST Job: Status {status}, ID: {job_id_a}")

    if job_id_a:
        status, fetch_job = make_request(f"{BASE_URL}/jobs/{job_id_a}/", "GET", headers=headers_a)
        print(f"GET Created Job: Status {status}")

        status, patch_job = make_request(f"{BASE_URL}/jobs/{job_id_a}/", "PATCH", {
            "title": "Lead Python Engineer"
        }, headers=headers_a)
        patch_data = patch_job.get("data") if isinstance(patch_job.get("data"), dict) else patch_job
        print(f"PATCH Job: Status {status}, Title: {patch_data.get('title') if isinstance(patch_data, dict) else patch_data}")

    # 3. RESUME FLOW
    print("\n--- 3. RESUME FLOW ---")
    status, new_resume = make_request(f"{BASE_URL}/resumes/", "POST", {
        "title": "Senior Backend Software Engineer Resume",
        "target_role": "Senior Backend Architect",
        "content_data": {
            "contact": {"name": "User A", "email": user_a_email, "phone": "+1-555-0199"},
            "summary": "Accomplished Senior Python Engineer with 6+ years experience architecting Django APIs and PostgreSQL systems.",
            "sections": [
                {
                    "name": "Experience",
                    "items": [
                        {
                            "title": "Senior Backend Developer",
                            "company": "Enterprise Cloud Inc",
                            "dates": "2021 - Present",
                            "description": "Architected microservices handling 50k requests/sec. Optimized SQL queries reducing latency by 45%."
                        }
                    ]
                },
                {
                    "name": "Projects",
                    "items": [
                        {
                            "title": "CareerOS Platform",
                            "description": "Designed deterministic AI career guidance platform using Python Django and React."
                        }
                    ]
                },
                {
                    "name": "Skills",
                    "items": ["Python", "Django", "PostgreSQL", "Docker", "REST API", "Redis"]
                }
            ]
        }
    }, headers=headers_a)
    resume_data = new_resume.get("data") if isinstance(new_resume.get("data"), dict) else new_resume
    resume_id_a = resume_data.get("id") if isinstance(resume_data, dict) else None
    print(f"POST Resume: Status {status}, ID: {resume_id_a}")

    if resume_id_a:
        status, fetch_resume = make_request(f"{BASE_URL}/resumes/{resume_id_a}/", "GET", headers=headers_a)
        print(f"GET Resume: Status {status}")

    # 4. SKILL GAP FLOW
    if job_id_a:
        print("\n--- 4. SKILL GAP FLOW (DETERMINISTIC) ---")
        status, skill_gap = make_request(f"{BASE_URL}/ai/skill-gap/", "POST", {
            "job_id": job_id_a
        }, headers=headers_a)
        gap_data = skill_gap.get("data") if isinstance(skill_gap.get("data"), dict) else skill_gap
        print(f"POST Skill Gap: Status {status}, Response: {bool(gap_data)}")

    # 5. ROADMAP FLOW
    if job_id_a:
        print("\n--- 5. ROADMAP FLOW ---")
        status, roadmap = make_request(f"{BASE_URL}/ai/roadmap/generate/", "POST", {
            "job_id": job_id_a
        }, headers=headers_a)
        roadmap_data = roadmap.get("data") if isinstance(roadmap.get("data"), dict) else roadmap
        roadmap_id_a = roadmap_data.get("id") if isinstance(roadmap_data, dict) else None
        print(f"POST Roadmap Generate: Status {status}, ID: {roadmap_id_a}")
    else:
        roadmap_id_a = None

    # 6. RESUME REVIEW DETERMINISTIC
    if resume_id_a:
        print("\n--- 6. RESUME REVIEW (DETERMINISTIC, 0 LLM) ---")
        status, review_det = make_request(f"{BASE_URL}/ai/resume-review/", "POST", {
            "resume_id": resume_id_a,
            "enhance_with_ai": False
        }, headers=headers_a)
        det_data = review_det.get("data") if isinstance(review_det.get("data"), dict) else review_det
        score = det_data.get("score") if isinstance(det_data, dict) else None
        print(f"POST Resume Review (Deterministic): Status {status}, Score: {score}")

        # 7. RESUME REVIEW AI ENHANCEMENT
        print("\n--- 7. RESUME REVIEW (AI ENHANCEMENT) ---")
        status, review_ai = make_request(f"{BASE_URL}/ai/resume-review/", "POST", {
            "resume_id": resume_id_a,
            "enhance_with_ai": True
        }, headers=headers_a)
        print(f"POST Resume Review (AI): Status {status}")

    # 8. JOB MATCH FLOW
    if resume_id_a and job_id_a:
        print("\n--- 8. JOB MATCH FLOW ---")
        status, job_match = make_request(f"{BASE_URL}/ai/job-match/", "POST", {
            "resume_id": resume_id_a,
            "job_id": job_id_a
        }, headers=headers_a)
        jm_data = job_match.get("data") if isinstance(job_match.get("data"), dict) else job_match
        print(f"POST Job Match: Status {status}, Match Score: {jm_data.get('match_score') if isinstance(jm_data, dict) else jm_data}")

    # 9. COVER LETTER FLOW
    print("\n--- 9. COVER LETTER FLOW ---")
    status, cover_letter = make_request(f"{BASE_URL}/ai/cover-letter/", "POST", {
        "job_title": "Senior Backend Developer",
        "company_name": "Tech Corp",
        "job_description": "Building APIs with Django and PostgreSQL",
        "tone": "professional"
    }, headers=headers_a)
    print(f"POST Cover Letter: Status {status}")

    # 10. CAREER ADVICE FLOW
    print("\n--- 10. CAREER ADVICE FLOW ---")
    status, advice = make_request(f"{BASE_URL}/ai/career-advice/", "POST", {
        "target_role": "Solutions Architect",
        "industry": "Cloud Computing"
    }, headers=headers_a)
    print(f"POST Career Advice: Status {status}")

    # 11. AI CHAT FLOW
    print("\n--- 11. AI CHAT FLOW ---")
    status, chat_res = make_request(f"{BASE_URL}/ai/chat/", "POST", {
        "prompt": "What skills should I learn for Cloud Architecture?"
    }, headers=headers_a)
    print(f"POST AI Chat: Status {status}")

    # 12. TENANT ISOLATION
    print("\n--- 12. TENANT ISOLATION CHECKS (USER B -> USER A RESOURCES) ---")
    if job_id_a and token_b:
        status_job, _ = make_request(f"{BASE_URL}/jobs/{job_id_a}/", "GET", headers=headers_b)
        print(f"User B access User A Job: Status {status_job} (Expected: 404)")

    if resume_id_a and token_b:
        status_resume, _ = make_request(f"{BASE_URL}/resumes/{resume_id_a}/", "GET", headers=headers_b)
        print(f"User B access User A Resume: Status {status_resume} (Expected: 404)")

        status_rr, _ = make_request(f"{BASE_URL}/ai/resume-review/", "POST", {
            "resume_id": resume_id_a,
            "enhance_with_ai": False
        }, headers=headers_b)
        print(f"User B Resume Review on User A Resume: Status {status_rr} (Expected: 404)")

    if resume_id_a and job_id_a and token_b:
        status_jm, _ = make_request(f"{BASE_URL}/ai/job-match/", "POST", {
            "resume_id": resume_id_a,
            "job_id": job_id_a
        }, headers=headers_b)
        print(f"User B Job Match on User A Resume: Status {status_jm} (Expected: 404)")

    if roadmap_id_a and token_b:
        status_rm, _ = make_request(f"{BASE_URL}/ai/roadmap/{roadmap_id_a}/", "GET", headers=headers_b)
        print(f"User B access User A Roadmap: Status {status_rm} (Expected: 404)")

    # 13. ERROR HANDLING
    print("\n--- 13. ERROR HANDLING CHECKS ---")
    status_unauth, res_unauth = make_request(f"{BASE_URL}/jobs/", "GET")
    print(f"Unauthenticated GET /jobs/: Status {status_unauth} (Expected: 401)")

    status_invalid_uuid, res_invalid_uuid = make_request(f"{BASE_URL}/jobs/not-a-uuid/", "GET", headers=headers_a)
    print(f"Malformed UUID GET /jobs/not-a-uuid/: Status {status_invalid_uuid} (Expected: 404)")

    status_nonexistent_uuid, res_nonexistent_uuid = make_request(f"{BASE_URL}/jobs/00000000-0000-0000-0000-000000000000/", "GET", headers=headers_a)
    print(f"Nonexistent UUID GET /jobs/00000000...: Status {status_nonexistent_uuid} (Expected: 404)")

    status_missing_fields, res_missing_fields = make_request(f"{BASE_URL}/jobs/", "POST", {}, headers=headers_a)
    print(f"Missing required fields POST /jobs/: Status {status_missing_fields} (Expected: 400)")

    # 14. RATE LIMITING
    print("\n--- 14. RATE LIMITING CHECK ---")
    print("Testing rapid unauthenticated auth login calls to test AnonRateThrottle...")
    throttled = False
    for i in range(110):
        code, body = make_request(f"{BASE_URL}/auth/login/", "POST", {"email": "invalid@test.com", "password": "wrong"})
        if code == 429:
            throttled = True
            print(f"Throttled successfully at attempt {i+1}: HTTP 429 Too Many Requests!")
            break
    if not throttled:
        print("Rate limiting check: No 429 reached within 110 requests (AnonRateThrottle configured at 100/day).")

if __name__ == "__main__":
    main()
