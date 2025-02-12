import React, { useState } from 'react';
import ComposerWrapper from '../composer/ComposerWrapper';

const Composer = () => {
  const schema = {
    fileUploader: {
      type: "uploader",
      label: "Upload files",
      help: "If your job needs any additional files or directories that are stored on your local machine, e.g., data files, to run your job, you can upload them here. In the dropdown, select if you wish to upload files or directories, and click the Add button. The file browser will pop up, where you can select files or directories. You can upload multiple files and directories. If you selected a file to upload by mistake, you can remove it by clicking on that particular file's name."
    },
    testModule1: {
      type: "module",
      label: "Add modules",
      help: "Modules are used to manage all the software packages available on ACES. If your job needs a software package, just start typing in the search bar, and it will show all available software modules matching the entered string. Select the software module you want and click the add button. The dropdown on the right shows all available toolchains. If you need multiple software modules, use the same toolchain. All added modules will show up in little blue bubbles. If you want to remove any of the added modules, just click on its name.",
      toolchains: [
        {
          label: "Default (foss/2023b)",
          value: "modules"
        }
      ]
    },
    ContainerTasks: {
      type: "rowContainer",
      label: "Tasks",
      elements: {
        tasks: {
          type: "number",
          label: "Number of tasks",
          help: "This is the number of tasks your code can utilize. This is mainly for codes that use MPI. If you are not sure, just leave this as 1",
          name: "tasks",
          value: "1"
        },
        AdvancedCheckbox: {
          type: "checkbox",
          label: "Advanced task options",
          name: "advancedbox",
          help: "Check this box if you want to provide advanced task placement options. These are advanced settings. Only use if you are familiar with these options",
          value: "Yes"
        },
        nodes: {
          type: "text",
          label: "Number of nodes",
          help: "Only set this field if you requested multiple tasks above and you want to distribute these tasks over multiple nodes. This is most common for MPI codes. If you are not sure, or if you don't want to explicitly distribute tasks over multiple nodes, leave this value at 0.",
          name: "nodes",
          value: "3",
          condition: "advancedbox.Yes"
        },
        cpus: {
          type: "number",
          label: "Number of cpus per tasks",
          help: "This option is mostly used for hybrid codes (typically codes that use both MPI and OpenMP). Only set this field if you are sure your code will utilze multiple threads per task. Keep in mind the total number of cores will be #tasks multiplied by #cpus_per_task).",
          name: "cpus",
          value: "1",
          max: "48",
          condition: "advancedbox.Yes"
        }
      }
    },
    ContainerGPU: {
      type: "rowContainer",
      label: "GPU",
      elements: {
        gpuDropdown: {
          type: "select",
          label: "Use Accelerator",
          help: "Only select an accelerator if your job will utilize them. You might need to setup the environment for the accelerator you selected in the job script.",
          name: "gpuDropdown",
          options: [
            { value: "", label: "NONE" },
            { value: "a100", label: "A100" },
            { value: "a40", label: "A40" },
            { value: "a30", label: "A30" },
            { value: "a10", label: "A10" },
            { value: "t4", label: "T4" }
          ]
        },
        numgpus: {
          type: "number",
          label: "#GPUs",
          help: "Number of GPUs you want to use. On Grace, in theory you can request up to 10.",
          name: "numgpu",
          value: "1",
          max: "10",
          condition: "gpuDropdown.a100 || gpuDropdown.a40 || gpuDropdown.a30 || gpuDropdown.a10 || gpuDropdown.t4"
        }
      }
    },
    ContainerAdditional: {
      type: "rowContainer",
      label: "Additional",
      elements: {
        memory: {
          type: "unit",
          label: "TOTAL Memory",
          name: "memory",
          help: "OPTIONAL: Provide the total amount of memory you need to estimate the job needs. It's best to be conservative and request more. If your job tries to use more memory than requested, your job will be killed immediately, and you might lose all intermediate results. The composer will use a default value if you don't enter any value.",
          units: [
            {
              label: "GB",
              value: "G"
            }
          ]
        },
        Walltime: {
          type: "time",
          label: "Expected run time",
          help: "OPTIONAL: Provide the time you estimate the job will need. It's best to be conservative when requesting wall time. If your job exceeds the requested wall time, your job will be killed immediately, and you might lose all intermediate results. If you don't enter a value, composer will use a default value of 2 hours.",
          name: "walltime",
          value: ""
        },
        account: {
          type: "dynamicSelect",
          label: "Project Account",
          help: "OPTIONAL: if you want to use a different project account than your default account, you can provide the account number here.",
          name: "account",
          retriever: "/scratch/user/a11155/list_accounts"
        },
        extraText: {
          type: "text",
          label: "Additional Slurm parameters",
          help: "OPTIONAL: You can specify Slurm-specific parameters here, e.g. --exclusive or --reservation=XXX. This is a specialized field to tailor your specific job requirements. Only use this option if you are familiar with advanced Slurm flags.",
          name: "extra_slurm",
          value: ""
        }
      }
    }
  };


  const defaultValues = {
    gpuDropdown: {label:"A100", value:"a100"},
    numgpu: "2",
    memory: "64G",
    walltime: "50:30:00",
  };

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handlePreview = async (formData) => {
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Preview failed');
      }
      const preview = await response.json();
      console.log('Preview:', preview);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleFileChange = (files) => {
    console.log('Files updated:', files);
  };

  return (
    <div style={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ComposerWrapper
          schema={schema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          onPreview={handlePreview}
          onFileChange={handleFileChange}
          apiEndpoint="/api/submit"
          title="Form Title"
          className="job-composer"
        />
      </div>
    </div>
  );
};

export default Composer;
