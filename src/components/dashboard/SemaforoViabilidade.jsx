import { useState } from 'react';

const SemaforoViabilidade = ({ dados }) => {
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

  const categorias = [
    { 
      key: 'alta', 
      label: 'Alta Viabilidade', 
      color: 'bg-green-500', 
      textColor: 'text-green-700',
      bgLight: 'bg-green-50'
    },
    { 
      key: 'media', 
      label: 'Média Viabilidade', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50'
    },
    { 
      key: 'risco', 
      label: 'Zona de Risco', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-700',
      bgLight: 'bg-orange-50'
    },
    { 
      key: 'critico', 
      label: 'Crítico', 
      color: 'bg-red-500', 
      textColor: 'text-red-700',
      bgLight: 'bg-red-50'
    }
  ];

  const getPercentual = (valor) => {
    const totalProcessados = dados?.totalProcessados || 0;
    return totalProcessados ? ((valor / totalProcessados) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Resumo Visual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categorias.map((categoria) => {
          const valor = dados?.distribuicao?.[categoria.key] || 0;
          const percentual = getPercentual(valor);

          return (
            <div 
              key={categoria.key}
              className={`${categoria.bgLight} rounded-lg p-4 border-l-4 ${categoria.color.replace('bg-', 'border-')}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {categoria.label}
                  </p>
                  <p className={`text-2xl font-bold ${categoria.textColor}`}>
                    {valor}
                  </p>
                  <p className="text-xs text-slate-500">
                    {percentual}% dos processados
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de Candidatos por Categoria */}
      {dados?.candidatos && dados.candidatos.length > 0 ? (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Candidatos Processados por Categoria
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {dados.candidatos.map((candidato) => {
              const categoria = categorias.find(c => c.key === candidato.categoria?.toLowerCase());
              return (
                <div 
                  key={candidato.id}
                  className="flex items-center justify-between bg-white rounded-md p-3 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setCandidatoSelecionado(candidato)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${categoria?.color}`}></div>
                    <span className="text-sm font-medium text-slate-700">
                      {candidato.nome}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${categoria?.textColor}`}>
                      {candidato.score}/100
                    </span>
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`${categoria?.color} h-2 rounded-full`}
                        style={{ width: `${candidato.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-slate-500">Nenhum candidato com análise de viabilidade disponível</p>
          <p className="text-xs text-slate-400 mt-1">
            Execute a análise de viabilidade nos candidatos para ver os resultados aqui
          </p>
        </div>
      )}

      {/* Modal de detalhes do candidato */}
      {candidatoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Detalhes - {candidatoSelecionado.nome}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Score de Viabilidade:</span>
                <span className="font-bold">{candidatoSelecionado.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Categoria:</span>
                <span className="font-bold capitalize">{candidatoSelecionado.categoria}</span>
              </div>
            </div>
            <button
              onClick={() => setCandidatoSelecionado(null)}
              className="mt-4 w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Janela expansível: Composição da Viabilidade */}
      <div className="mt-6">
        <details className="bg-white rounded-lg shadow border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-700 text-base mb-2">
            COMPOSIÇÃO DA VIABILIDADE
          </summary>
          <div className="mt-4 text-sm text-slate-700 space-y-4">
            <h4 className="font-bold mb-2">Regras chave que delimitam “quanto vale” cada voto</h4>
            <table className="w-full text-xs mb-4 border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border">Norma</th>
                  <th className="p-2 border">Deputado Federal</th>
                  <th className="p-2 border">Deputado Estadual</th>
                  <th className="p-2 border">Observação prática</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Quociente Eleitoral (QE 2022)</td>
                  <td className="p-2 border">204 315 votos</td>
                  <td className="p-2 border">112 657 votos</td>
                  <td className="p-2 border">Votos válidos ÷ nº de cadeiras</td>
                </tr>
                <tr>
                  <td className="p-2 border">Desempenho mínimo p/ ser diplomado</td>
                  <td className="p-2 border">10 % do QE → ≈ 20 k</td>
                  <td className="p-2 border">10 % do QE → ≈ 11 k</td>
                  <td className="p-2 border">Art. 108 CE – para ocupar qualquer cadeira do partido/federação</td>
                </tr>
                <tr>
                  <td className="p-2 border">Disputar vagas de sobra</td>
                  <td className="p-2 border">20 % do QE → ≈ 41 k</td>
                  <td className="p-2 border">20 % do QE → ≈ 23 k</td>
                  <td className="p-2 border">Art. 109 §2º CE – se a cadeira vier pelas sobras</td>
                </tr>
                <tr>
                  <td className="p-2 border">Eleição “autossuficiente”</td>
                  <td className="p-2 border">≥ 1 QE pessoal → ≈ 204 k</td>
                  <td className="p-2 border">≥ 1 QE pessoal → ≈ 113 k</td>
                  <td className="p-2 border">O candidato leva a vaga mesmo que o partido não atinja o QP</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-bold mb-2">Corte interno na federação PP + União (base 2022)</h4>
            <table className="w-full text-xs mb-4 border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border">Cenário simulação</th>
                  <th className="p-2 border">Vagas da federação</th>
                  <th className="p-2 border">Votos do  6º / 7º / 5º eleito*</th>
                  <th className="p-2 border">Interpretação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Realista (repete 2022)</td>
                  <td className="p-2 border">6 federais<br/>10 estaduais</td>
                  <td className="p-2 border">Federal: 6º = ≈ 72 k<br/>Estadual: 10º = ≈ 39 k</td>
                  <td className="p-2 border">Quem fizer ≥ 72 k (Fed) ou ≥ 39 k (Est) fica dentro da “faixa de corte” dos eleitos diretos</td>
                </tr>
                <tr>
                  <td className="p-2 border">Otimista (+1 vaga)</td>
                  <td className="p-2 border">7 federais<br/>11 estaduais</td>
                  <td className="p-2 border">Federal: 7º = ≈ 62 k<br/>Estadual: 11º = ≈ 36 k</td>
                  <td className="p-2 border">Se a federação crescer + 1 p.p. de votos, bastam ~62 k / 36 k</td>
                </tr>
                <tr>
                  <td className="p-2 border">Pessimista ( 1 vaga)</td>
                  <td className="p-2 border">5 federais<br/> 9 estaduais</td>
                  <td className="p-2 border">Federal: 5º = ≈ 107 k<br/>Estadual: 9º = ≈ 42 k</td>
                  <td className="p-2 border">Queda de participação eleva o corte: segura se com ~107 k / 42 k</td>
                </tr>
                <tr>
                  <td className="p-2 border" colSpan={4}>* Valores retirados da lista real de 2022 ao se somar os votos dos dois partidos e ordenar os candidatos.</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-bold mb-2">O que esses números significam na prática</h4>
            <ol className="list-decimal ml-5 mb-2">
              <li>
                <span className="font-semibold">Faixa de segurança interna</span>
                <ul className="list-disc ml-5">
                  <li>Federal: mire 70–110 mil votos (a depender se o cenário é otimista ou negativo).</li>
                  <li>Estadual: mire 35–45 mil votos.</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">Elegibilidade legal</span>
                <ul className="list-disc ml-5">
                  <li>
                    Mesmo  20 % do QE (≈ 41 k / 23 k) não garante a vaga; só permite disputá-la nas sobras se o partido ainda tiver direito.
                  </li>
                  <li>
                    Se o candidato ultrapassar 1 QE pessoal (≈ 204 k / 113 k) ele já “arrasta” a própria cadeira, independentemente do total da federação (é o chamado puxador).
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </details>
      </div>

            <div className="mt-6">
        <details className="bg-white rounded-lg shadow border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-700 text-base mb-2">
            O QUE É O SCORE CUBE?
          </summary>
          <div className="mt-4 text-sm text-slate-700 space-y-4">
            <h4 className="font-bold mb-2">O que é o Score Cube?</h4>
            <p>
              O Score Cube é um indicador único, de 0 a 100 %, que resume o quão provável é um candidato ser eleito.<br />
              Ele combina, em partes iguais, dois pilares que mais influenciam uma campanha moderna:
            </p>
            <table className="w-full text-xs mb-4 border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border">Pilar</th>
                  <th className="p-2 border">O que mede</th>
                  <th className="p-2 border">Como é calculado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Força Eleitoral</td>
                  <td className="p-2 border">O tamanho real da sua base de votos</td>
                  <td className="p-2 border">
                    Razão de votos (R_V) = votos que o candidato já tem ÷ votos mínimos necessários.<br />
                    Para quem nunca disputou, usamos a média de interações por post dividida por um valor referência dos eleitos.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border">Força Digital</td>
                  <td className="p-2 border">A capacidade de engajar e mobilizar eleitores on-line</td>
                  <td className="p-2 border">
                    Razão de engajamento (R_E) = taxa de engajamento do perfil ÷ 1 % (padrão considerado saudável).
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              Depois, fazemos a média dessas duas razões e multiplicamos por 100.<br />
              <b>Exemplo:</b> se o candidato atinge 80 % da meta de votos (0,80) e 70 % do engajamento ideal (0,70):<br />
              <span className="bg-slate-100 rounded px-2 py-1 inline-block mt-2 mb-2 font-mono">
                Score Cube = (0,80 + 0,70) / 2 x 100 = 75 %
              </span>
            </p>
            <h4 className="font-bold mb-2">Como interpretar</h4>
            <table className="w-full text-xs mb-4 border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border">Faixa</th>
                  <th className="p-2 border">Significado</th>
                  <th className="p-2 border">Leitura prática</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">75–100 %</td>
                  <td className="p-2 border">Alta Viabilidade</td>
                  <td className="p-2 border">Forte chance de vitória. A campanha está bem encaminhada.</td>
                </tr>
                <tr>
                  <td className="p-2 border">50–74 %</td>
                  <td className="p-2 border">Baixa Viabilidade</td>
                  <td className="p-2 border">Tem bons sinais, mas ainda precisa crescer.</td>
                </tr>
                <tr>
                  <td className="p-2 border">25–49 %</td>
                  <td className="p-2 border">Zona de Risco</td>
                  <td className="p-2 border">Situação incerta; exige ajustes urgentes.</td>
                </tr>
                <tr>
                  <td className="p-2 border">0–24 %</td>
                  <td className="p-2 border">Crítico</td>
                  <td className="p-2 border">Probabilidade muito pequena de eleição.</td>
                </tr>
              </tbody>
            </table>
            <h4 className="font-bold mb-2">Por que é confiável?</h4>
            <ul className="list-disc ml-5 mb-2">
              <li>Base de votos mostra onde o candidato já está forte.</li>
              <li>Engajamento indica a velocidade de conquista de novos eleitores.</li>
              <li>Os pesos iguais (50 % + 50 %) garantem que nenhuma dimensão domine a outra: precisamos de votos e de mobilização digital.</li>
            </ul>
            <h4 className="font-bold mb-2">Como usamos nos cenários (Otimista / Realista / Pessimista)?</h4>
            <ol className="list-decimal ml-5 mb-2">
              <li>Realista = Score Cube puro (o cenário mais provável).</li>
              <li>Otimista = quando fatores positivos se alinham (subimos o Score conforme o potencial de crescimento).</li>
              <li>Pessimista = se situações adversas ocorrerem (reduzimos o Score pela margem de risco).</li>
            </ol>
            <p>
              Isso gera um painel claro para decisões rápidas:<br />
              <b>Onde concentrar esforços?</b> — Basta olhar qual pilar está mais fraco e focar ações ali.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SemaforoViabilidade;