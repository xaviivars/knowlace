import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function Join () {

    return (
        <div className="flex flex-col items-center gap-15 pt-32">
            
            <h1 className="text-6xl font-bold text-white">
                Knowlace.
            </h1>

            <div className="flex flex-row max-w-120">
                <Input className="bg-gray w-64"
                    placeholder="Introduce un código de sesión"
                />

                <Button>
                    Unirse
                </Button>
            </div>
        </div>
    )

}