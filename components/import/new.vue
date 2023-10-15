<template>
  <div>
    <c-button @click="openFilePicker">Import</c-button>
    <c-button class="ml-2" @click="pasteFromClipboard">Paste</c-button>
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStrongStore } from "../../stores/strong.store";

const fileInput = ref<HTMLInputElement | null>(null);
const strongStore = useStrongStore();

const openFilePicker = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const selectedFile = input.files[0];

    if (selectedFile.type === "text/csv") {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csvContent = e.target?.result;
        strongStore.importDatas(csvContent as string);
      };

      reader.readAsText(selectedFile);
    } else {
      console.error('Selected file is not a CSV.');
    }
  }
};

const pasteFromClipboard = async () => {
  try {
    const clipboardData = await navigator.clipboard.readText();
    
    strongStore.importDatas(clipboardData);
  } catch (error) {
    console.error('Error pasting from clipboard:', error);
  }
};
</script>