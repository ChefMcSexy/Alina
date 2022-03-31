import { validator } from '../../utils/validator.ts'

export class check {

    async check_internet_connection(fatal:boolean) {
        let checkInternet = new validator("Checking internet connection...")
        try {
            await fetch("https://live-hack.org/")
            checkInternet.validate()
            return;
        } catch(err){}
        checkInternet.fail(fatal)
    }

}