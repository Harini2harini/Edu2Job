
lines_to_delete_start = 827
lines_to_delete_end = 1038
file_path = r'c:\Users\harin\OneDrive\Desktop\projects\Edu2Job\backend\admin_panel\views.py'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed to 0-indexed
start_idx = lines_to_delete_start - 1
end_idx = lines_to_delete_end

# Keep lines before start and after end
new_lines = lines[:start_idx] + lines[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Deleted lines {lines_to_delete_start} to {lines_to_delete_end} in {file_path}")
