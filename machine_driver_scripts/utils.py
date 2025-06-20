import os
import shutil
import json


def retrieve_alphapickle(pickle, proteinfasta, outputdir):
    if pickle == "true":
       name = os.path.splitext(os.path.basename(proteinfasta))[0]
       return f"run_AlphaPickle.py   -od " +  outputdir + "/" + name
    else:
       return f""


def drona_add_additional_file(additional_file):
    user_id = os.getenv('USER')

    additional_files_path = os.path.join("/tmp", f"{user_id}.additional_files")
    if os.path.exists(additional_files_path):
        with open(additional_files_path, 'r') as file:
            additional_files = json.load(file)
    else:
        additional_files = {'files': []}    
    
    additional_files['files'].append(additional_file)
    with open(additional_files_path, "w") as file:
        json.dump(additional_files, file)


def drona_add_warning(warning):
    user_id = os.getenv('USER')

    warnings_path = os.path.join("/tmp", f"{user_id}.warnings")
    if os.path.exists(warnings_path):
        with open(warnings_path, 'r') as file:
            warnings = json.load(file)
    else:
        warnings = {'warnings': []}    
    
    warnings['warnings'].append(warning)
    with open(warnings_path, "w") as file:
        json.dump(warnings, file)

