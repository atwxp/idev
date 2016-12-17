<template>
<div>
    <req-area></req-area>

    <status-area></status-area>
</div>
</template>

<script>
import ReqArea from 'components/req-area'
import StatusArea from 'components/status-area'

export default {
    components: {
        ReqArea,
        StatusArea
    }
}
</script>
