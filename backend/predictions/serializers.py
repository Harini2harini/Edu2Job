# predictions/serializers.py (Complete File)
from rest_framework import serializers
from .models import PredictionHistory, MLModelVersion, JobRole, Skill, PredictionFeedback
from users.serializers import UserProfileSerializer
import uuid

class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class PredictionHistorySerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionHistory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_user_details(self, obj):
        return {
            'email': obj.user.email,
            'name': obj.user.name
        }
    
    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y %I:%M %p")

class PredictionInputSerializer(serializers.Serializer):
    # Personal Information
    age = serializers.IntegerField(min_value=18, max_value=70, required=True)
    gender = serializers.CharField(max_length=10, required=True)
    location_country = serializers.CharField(max_length=100, default='India')
    location_city_tier = serializers.CharField(max_length=10, default='Tier 1')
    
    # Education
    highest_degree = serializers.CharField(max_length=50, required=True)
    degree_field = serializers.CharField(max_length=100, required=True)
    institution_tier = serializers.CharField(max_length=50, required=True)
    gpa_score = serializers.FloatField(min_value=0, max_value=10, required=True)
    graduation_year = serializers.IntegerField(min_value=1900, max_value=2100, required=True)
    
    # Experience
    total_experience_years = serializers.FloatField(min_value=0, max_value=50, required=True)
    current_role_level = serializers.CharField(max_length=50, required=True)
    industry = serializers.CharField(max_length=100, required=True)
    company_size = serializers.CharField(max_length=50, default='Medium')
    job_hop_count = serializers.IntegerField(min_value=0, default=0)
    has_managerial_exp = serializers.BooleanField(default=False)
    team_size_managed = serializers.IntegerField(min_value=0, default=0)
    budget_responsibility = serializers.IntegerField(min_value=0, default=0)
    international_exp = serializers.BooleanField(default=False)
    
    # Skills (Technical) - Rate 0-10
    skill_python = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_java = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_javascript = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_cpp = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_csharp = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_go = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_rust = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_kotlin = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_swift = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_php = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ruby = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_scala = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_typescript = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_r = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_perl = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_bash = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_powershell = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_react = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_angular = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_vue = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_nodejs = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_django = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_flask = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_spring = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_laravel = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_express = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ruby_on_rails = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_asp_net = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_jquery = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_html_css = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_bootstrap = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_sass = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_webpack = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_sql = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_mongodb = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_postgresql = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_mysql = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_redis = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_elasticsearch = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_oracle_db = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_sql_server = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_cassandra = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_dynamodb = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_firebase = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_cosmosdb = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_machine_learning = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_deep_learning = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_data_analysis = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_data_visualization = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_tensorflow = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_pytorch = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_scikit_learn = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_pandas = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_numpy = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_tableau = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_powerbi = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_qlik = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_hadoop = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_spark = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_kafka = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_airflow = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_aws = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_azure = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_google_cloud = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_docker = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_kubernetes = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_jenkins = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ansible = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_terraform = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_git = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ci_cd = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_linux = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_windows_server = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_nginx = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_apache = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_android_development = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ios_development = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_react_native = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_flutter = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_xamarin = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ionic = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_selenium = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_junit = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_testng = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_jmeter = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_postman = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_soapui = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_cypress = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_jest = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_cybersecurity = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_network_security = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ethical_hacking = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_penetration_testing = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_security_audit = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_blockchain = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_iot = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_ar_vr = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_computer_vision = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_nlp = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_robotics = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_embedded_systems = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_fpga = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_vls = serializers.FloatField(min_value=0, max_value=10, default=0) # Note: Typo in dataset, might be VLSI
    
    # Skills (Soft) - Rate 0-10
    skill_communication = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_leadership = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_problem_solving = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_teamwork = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_project_management = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_english_proficiency = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_presentation_skills = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_negotiation_skills = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_time_management = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_critical_thinking = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_creativity = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_adaptability = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_conflict_resolution = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_mentoring = serializers.FloatField(min_value=0, max_value=10, default=0)
    skill_client_management = serializers.FloatField(min_value=0, max_value=10, default=0)
    
    # Additional
    second_language = serializers.CharField(max_length=50, default='None')
    additional_certs_count = serializers.IntegerField(min_value=0, default=0)
    online_courses_completed = serializers.IntegerField(min_value=0, default=0)
    research_publications = serializers.IntegerField(min_value=0, default=0)
    academic_awards = serializers.IntegerField(min_value=0, default=0)
    professional_network_size = serializers.IntegerField(min_value=0, default=0)
    remote_work_percentage = serializers.FloatField(min_value=0, max_value=100, default=0)
    freelance_projects = serializers.IntegerField(min_value=0, default=0)
    patents_filed = serializers.IntegerField(min_value=0, default=0)
    open_source_contributions = serializers.IntegerField(min_value=0, default=0)
    career_gap_months = serializers.IntegerField(min_value=0, default=0)
    
    # Metrics needed by model
    missing_skill_count = serializers.IntegerField(min_value=0, default=0)
    skill_diversity_index = serializers.FloatField(min_value=0, default=0)
    career_progression_rate = serializers.FloatField(min_value=0, default=1.5)
    industry_experience_years = serializers.FloatField(min_value=0, default=0)
    profile_completeness = serializers.FloatField(min_value=0, default=85)
    
    # Certifications
    cert_aws = serializers.BooleanField(default=False)
    cert_google_cloud = serializers.BooleanField(default=False)
    cert_azure = serializers.BooleanField(default=False)
    cert_pmp = serializers.BooleanField(default=False)
    cert_scrum = serializers.BooleanField(default=False)
    cert_data_science = serializers.BooleanField(default=False)
    cert_cybersecurity = serializers.BooleanField(default=False)
    cert_digital_marketing = serializers.BooleanField(default=False)
    cert_oracle = serializers.BooleanField(default=False)
    cert_redhat = serializers.BooleanField(default=False)
    cert_cisco = serializers.BooleanField(default=False)
    cert_microsoft = serializers.BooleanField(default=False)
    cert_salesforce = serializers.BooleanField(default=False)
    cert_tableau = serializers.BooleanField(default=False)
    cert_python_institute = serializers.BooleanField(default=False)
    cert_java_ocp = serializers.BooleanField(default=False)
    cert_other = serializers.BooleanField(default=False)

    
    def validate(self, data):
        # Calculate years since graduation
        current_year = 2024
        graduation_year = data.get('graduation_year')
        if graduation_year:
            years_since_graduation = current_year - graduation_year
            if years_since_graduation < 0:
                raise serializers.ValidationError({
                    'graduation_year': 'Graduation year cannot be in the future'
                })
            data['years_since_graduation'] = years_since_graduation
        
        # Calculate various scores
        # Education score
        education_score = data.get('gpa_score', 0) * 10
        if data.get('academic_awards', 0) > 0:
            education_score += 5
        
        # Tech skill score (average of technical skills)
        tech_skill_columns = [col for col in data.keys() if col.startswith('skill_') and col not in [
            'skill_communication', 'skill_leadership', 'skill_problem_solving', 
            'skill_teamwork', 'skill_project_management', 'skill_english_proficiency',
            'skill_presentation_skills', 'skill_negotiation_skills', 'skill_time_management'
        ]]
        
        tech_skills_sum = sum(data.get(col, 0) for col in tech_skill_columns)
        tech_skill_score = tech_skills_sum / len(tech_skill_columns) if tech_skill_columns else 0
        
        # Soft skill score (average of soft skills)
        soft_skill_columns = [
            'skill_communication', 'skill_leadership', 'skill_problem_solving',
            'skill_teamwork', 'skill_project_management', 'skill_english_proficiency',
            'skill_presentation_skills', 'skill_negotiation_skills', 'skill_time_management'
        ]
        
        soft_skills_sum = sum(data.get(col, 0) for col in soft_skill_columns)
        soft_skill_score = soft_skills_sum / len(soft_skill_columns)
        
        # Certification score
        cert_columns = [col for col in data.keys() if col.startswith('cert_')]
        cert_score = sum(1 for col in cert_columns if data.get(col, False)) * 5
        
        # Experience quality score
        experience_quality_score = min(data.get('total_experience_years', 0) * 2, 20)
        if data.get('has_managerial_exp', False):
            experience_quality_score += 5
        if data.get('international_exp', False):
            experience_quality_score += 5
        
        # Overall profile score
        overall_profile_score = (
            education_score * 0.20 +
            tech_skill_score * 0.25 +
            soft_skill_score * 0.20 +
            cert_score * 0.15 +
            experience_quality_score * 0.20
        )
        
        # Store calculated scores
        data['education_score'] = education_score
        data['tech_skill_score'] = tech_skill_score
        data['soft_skill_score'] = soft_skill_score
        data['overall_profile_score'] = overall_profile_score
        data['experience_quality_score'] = experience_quality_score
        data['premium_cert_score'] = cert_score
        
        return data

class MLModelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModelVersion
        fields = '__all__'
        read_only_fields = ('created_at',)

class RetrainModelSerializer(serializers.Serializer):
    dataset_path = serializers.CharField(required=False)
    n_estimators = serializers.IntegerField(min_value=50, max_value=500, default=200)
    max_depth = serializers.IntegerField(min_value=5, max_value=50, default=20)
    notes = serializers.CharField(required=False, allow_blank=True)

# FEEDBACK SERIALIZERS
class PredictionFeedbackSerializer(serializers.ModelSerializer):
    prediction_details = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.name', read_only=True, allow_null=True)
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionFeedback
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_prediction_details(self, obj):
        return {
            'id': str(obj.prediction.id),
            'top_prediction': obj.prediction.top_prediction,
            'confidence_score': obj.prediction.confidence_score,
            'created_at': obj.prediction.created_at
        }
    
    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y %I:%M %p")

class PredictionFeedbackInputSerializer(serializers.Serializer):
    prediction_id = serializers.UUIDField(required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=500)
    user_id = serializers.UUIDField(required=False)
    user_email = serializers.EmailField(required=False)
    
    def validate(self, data):
        try:
            prediction = PredictionHistory.objects.get(id=data['prediction_id'])
            data['prediction'] = prediction
        except PredictionHistory.DoesNotExist:
            raise serializers.ValidationError({
                'prediction_id': 'Prediction not found'
            })
        
        # Check if user already gave feedback for this prediction
        if 'user_id' in data and data['user_id']:
            existing_feedback = PredictionFeedback.objects.filter(
                prediction=prediction,
                user_id=data['user_id']
            ).first()
            if existing_feedback:
                raise serializers.ValidationError({
                    'user_id': 'You have already submitted feedback for this prediction'
                })
        
        return data