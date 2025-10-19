import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function CadastroSucesso() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
          <CardDescription>
            Seu cadastro foi realizado com sucesso!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O responsável da equipe irá revisar suas informações. Você receberá uma confirmação em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
