import fs from 'fs'
import pa from 'path'
import ts from 'typescript'


const methods = ['get', 'post']

export default opts => ({
	name: 'architekt-serverfuncs',
	setup(build){
		build.onLoad(
			{
				filter: /.*/,
				namespace: 'server'
			},
			async ({ path, pluginData, ...args }) => {
				let srcAST = ts.createSourceFile(
					'functions.ts',
					fs.readFileSync(path, 'utf-8'),
					ts.ScriptTarget.Latest
				)

				let functions = srcAST.statements.filter(
					statement => ts.SyntaxKind[statement.kind] === 'FunctionDeclaration'
						&& ts.getModifiers(statement)?.some(
							modifier => ts.SyntaxKind[modifier.kind] === 'ExportKeyword'
						)
				)

				let resultAST = compileClientAST({ functions })
				let printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
				let code = printer.printNode(ts.EmitHint.Unspecified, resultAST, resultAST)

				if(opts.isServer){
					let serverAST = compileServerAST({ functions })
					let code = printer.printNode(ts.EmitHint.Unspecified, serverAST, serverAST)

					opts.captures.push({
						code,
						path
					})
				}

				return {
					contents: code,
					resolveDir: pa.dirname(path),
					loader: 'js',
					pluginData: {
						...pluginData,
						resolveOverride: {
							namespace: 'file'
						}
					}
				}
			}
		)
	}
})


function compileClientAST({ functions }){
	let statements = []

	for(let node of functions){
		let methodDecorator = node.illegalDecorators.find(
			decorator => methods.includes(decorator.expression.expression.escapedText)
		)

		statements.push(ts.factory.createVariableDeclarationList([
			ts.factory.createVariableDeclaration(
				node.name.escapedText,
				undefined,
				undefined,
				methodDecorator.expression
			)
		]))
	}

	statements.push(
		ts.factory.createExportDeclaration(
			undefined,
			false,
			ts.factory.createNamedExports(
				functions.map(
					f => ts.factory.createExportSpecifier(
						false,
						undefined,
						f.name.escapedText
					)
				)
			)
		)
	)

	return ts.factory.createSourceFile([
		createMethodsImport('@architekt/api/client'),
		...statements
	])
}

function compileServerAST({ functions }){
	return ts.factory.createSourceFile([
		createMethodsImport('@architekt/api/server'),
		ts.factory.createExportDefault(
			ts.factory.createFunctionExpression(
				undefined,
				undefined,
				undefined,
				undefined,
				[
					ts.factory.createParameterDeclaration(
						undefined,
						undefined,
						'router'
					)
				],
				undefined,
				ts.factory.createBlock([
					ts.factory.createReturnStatement(
						ts.factory.createObjectLiteralExpression(
							functions.map(
								f => {
									let methodDecorator = f.illegalDecorators.find(
										decorator => methods.includes(decorator.expression.expression.escapedText)
									)
							
									methodDecorator.expression.arguments.push(
										ts.factory.createFunctionExpression(
											undefined,
											undefined,
											undefined,
											undefined,
											f.parameters,
											undefined,
											f.body
										)
									)
	
									return ts.factory.createPropertyAssignment(
										f.name.escapedText,
										methodDecorator.expression
									)
								}
							)
						)
					)
				])
			)
		)
	])
}

function createMethodsImport(fromModule){
	return ts.factory.createImportDeclaration(
		undefined,
		ts.factory.createImportClause(
			false,
			undefined,
			ts.factory.createNamedImports(
				methods.map(
					method => ts.factory.createImportSpecifier(
						false,
						undefined,
						ts.factory.createIdentifier(method)
					)
				)
			)
		),
		ts.factory.createStringLiteral(fromModule)
	)
}