<script setup lang="ts">
import AppLink from '@/components/shared/AppLink.vue';
</script>
<template>
    <AppLink :to="{ name: 'home' }" class="inline-block w-fit">
        <div class="flex gap-1 justify-start items-center">
            <span class="text-primary">KINO</span>
            <span class="text-helper-red">XII</span>
        </div>
    </AppLink>
</template>