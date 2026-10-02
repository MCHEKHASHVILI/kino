<script setup lang="ts">
import ApplicationLogo from '@/components/shared/ApplicationLogo.vue';
</script>
<template>
    <footer class="p-8.5 pt-6.75 flex flex-col gap-5 fixed bottom-0 left-0 right-0 bg-page">
        <div class="h-px w-full bg-raised"></div>
        <div class="flex flex-row items-center justify-between">
            <ApplicationLogo class="text-button" />
            <span class="text-body-s text-secondary">© 2026 Kino XII. All rights reserved.</span>
        </div>
    </footer>
</template>