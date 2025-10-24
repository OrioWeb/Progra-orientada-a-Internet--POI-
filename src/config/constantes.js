//Aqui se meten cosas privadas o temas de configuracion o datos utilizados en varias partes de la aplicacion
export const config = {
    PORT: 3000,
    LIMITHISTORY: 100,
    MAXLENGTHUSER: 30,
    MAXLENGTHMSG: 280,
    RATELIMIT: {
        MAXMSGS: 10,
        WAITINGROOMms: 10000
    }
}