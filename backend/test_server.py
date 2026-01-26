from django.http import HttpResponse

def test_view(request):
    return HttpResponse("✅ Edu2Job Backend is WORKING!")

def api_test(request):
    return HttpResponse('{"status": "ok", "message": "API is live"}', content_type='application/json')
