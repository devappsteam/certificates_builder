<script setup lang="ts">
import HeaderBar from './components/HeaderBar.vue';
import SidebarNav from './components/SidebarNav.vue';
import CertificateEditor from './components/CertificateEditor.vue';
import StatusBar from './components/StatusBar.vue';
</script>

<template>
  <div class="flex flex-col h-screen">
    <HeaderBar />
    <div class="flex flex-1 overflow-hidden">
      <SidebarNav />
      <main class="flex-1 overflow-hidden bg-slate-50">
        <CertificateEditor />
      </main>
    </div>
    <StatusBar />
  </div>
</template>