from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'Edu2Job Backend',
        'message': 'API is running'
    })
