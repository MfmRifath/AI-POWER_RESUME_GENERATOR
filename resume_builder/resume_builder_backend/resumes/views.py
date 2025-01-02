import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openai import OpenAI
from dotenv import load_dotenv
from fpdf import FPDF  # Import the FPDF class
from django.http import FileResponse
import os  # For file handling

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Set up logging
logger = logging.getLogger(__name__)

class GenerateResume(APIView):
    def post(self, request):
        data = request.data
        logger.debug(f"Received data: {data}")  # Log the incoming data

        if not all([data.get('name'), data.get('email'), data.get('skills'), data.get('experience'), data.get('job_description')]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        Create a professional resume for:
        Name: {data.get('name')}
        Email: {data.get('email')}
        Skills: {data.get('skills')}
        Experience: {data.get('experience')}
        Tailored to the job description: {data.get('job_description')}
        """

        try:
            logger.debug(f"Generated prompt: {prompt}")  # Log the generated prompt

            # Use the chat completions endpoint for chat-based models
            response = client.chat.completions.create(
                model="gpt-4",  # or gpt-3.5-turbo, if you have access to it
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800
            )

            # Access the choices and message content correctly
            resume_text = response.choices[0].message.content.strip()

            # Sanitize text by replacing unsupported characters with '?'
            safe_text = resume_text.encode('latin-1', 'replace').decode('latin-1')

            # Create the PDF content
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            pdf.multi_cell(0, 10, safe_text)

            # Save the PDF to a file on disk
            pdf_filename = "resume.pdf"
            pdf.output(pdf_filename)

            # Return the PDF file as a FileResponse
            return FileResponse(open(pdf_filename, 'rb'), as_attachment=True, filename=pdf_filename, content_type="application/pdf")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")  # Log any other errors
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)