from docx import Document
import os
from django.http import FileResponse
from rest_framework.decorators import api_view

@api_view(['POST'])
def generate_tam_tru(request):
    try:
        # Lấy dữ liệu từ FE
        data = request.data
        
        # Đường dẫn tới file template
        template_path = os.path.join('file', 'CT01.doc')
        
        # Mở file template
        doc = Document(template_path)
        
        # Mapping giữa placeholder và dữ liệu thực tế
        replacements = {
            '{{fullname}}': data.get('fullname', ''),
            '{{birthday}}': data.get('birthday', ''),
            '{{gender}}': data.get('gender', ''),
            '{{cccd}}': data.get('cccd', ''),
            '{{username}}': data.get('username', ''),
            '{{email}}': data.get('email', ''),
            '{{address}}': data.get('address', '')
        }
        
        # Thay thế placeholder trong toàn bộ document
        for paragraph in doc.paragraphs:
            for key, value in replacements.items():
                if key in paragraph.text:
                    paragraph.text = paragraph.text.replace(key, value)
        
        # Thay thế trong tables (nếu có)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for key, value in replacements.items():
                        if key in cell.text:
                            cell.text = cell.text.replace(key, value)
        
        # Lưu file tạm
        output_path = os.path.join('file', 'CT01_output.doc')
        doc.save(output_path)
        
        # Trả về file để download
        return FileResponse(open(output_path, 'rb'), as_attachment=True, filename='CT01_tam_tru.doc')
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)
