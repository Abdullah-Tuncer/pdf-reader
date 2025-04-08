// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles/main.css'

// Vuetify
import {createVuetify} from 'vuetify'
import {tr} from "vuetify/locale";
import {md3} from "vuetify/blueprints";

export default createVuetify({
    // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
    blueprint: md3,
    locale: {
        locale: 'tr',
        fallback: 'tr',
        messages: {tr}
    },
    aliases: {
        // MyButton: VBtn,
    },
    defaults: {
        // MyButton: { color: 'primary', variant: 'text' },
        // VDataTable: {
        //     VDataTableRow: {
        //         align: 'start'
        //     }
        // }
    },
})
