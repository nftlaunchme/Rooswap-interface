import os

def gather_code(folder_path, output_file):
    """
    Gather code from all files in the specified folder and its subfolders, 
    and save it to an output file.
    """
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, _, files in os.walk(folder_path):
            for file in files:
                # Only process JavaScript/TypeScript and related files
                if file.endswith(('.js', '.ts', '.tsx', '.jsx')):
                    file_path = os.path.join(root, file)
                    outfile.write(f'\n\n// ----- File: {file} -----\n')
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                    outfile.write('\n\n// ----- End of File -----\n')

    print(f'All code gathered and saved to {output_file}')

# Set your source folder and output file path here
source_folder = r'src\components\SwapForm'
output_file = 'gathered_code_output.txt'

gather_code(source_folder, output_file)
