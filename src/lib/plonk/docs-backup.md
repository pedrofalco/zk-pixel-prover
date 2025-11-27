# PLONK Docs Backup

Este archivo consolida todos los `.md` que estaban en `plonk/` para tenerlos como respaldo.

---

## INSTALL-BARRETENBERG.md

# Instalación de Barretenberg (bb)

Barretenberg es el prover backend de Aztec que se usa para generar y verificar proofs de circuitos Noir.

## Opción 1: Descargar binario precompilado (Más fácil - Recomendado)

Los releases de [aztec-packages](https://github.com/AztecProtocol/aztec-packages/releases) incluyen binarios precompilados.

### Pasos:

1. **Ir a los releases:**
   - Visita: https://github.com/AztecProtocol/aztec-packages/releases
   - Descarga la versión más reciente (ej: `v2.1.8` o la última nightly)

2. **Descargar el binario para tu sistema:**
   - **macOS**: Busca un archivo como `barretenberg-macos-*.zip` o similar
   - **Linux**: Busca `barretenberg-linux-*.tar.gz` o similar
   - **Windows**: Busca `barretenberg-windows-*.zip` o similar

3. **Extraer y usar:**
   ```bash
   # Extraer el archivo descargado
   unzip barretenberg-macos-*.zip  # o tar -xzf para .tar.gz
   
   # El binario `bb` estará en la carpeta extraída
   # Agregar al PATH (opcional):
   export PATH="$PATH:$(pwd)/barretenberg-*/bin"
   ```

4. **Verificar:**
   ```bash
   bb --help
   ```

## Opción 2: Compilar desde fuente (Si no hay binarios disponibles)

El repositorio [aztec-packages](https://github.com/AztecProtocol/aztec-packages) contiene barretenberg como un subdirectorio.

### Pasos:

1. **Clonar el repositorio aztec-packages:**
   ```bash
   git clone https://github.com/AztecProtocol/aztec-packages.git
   cd aztec-packages
   ```

2. **Ejecutar el script de bootstrap:**
   ```bash
   ./bootstrap.sh full
   ```
   
   Este script:
   - Actualiza submódulos de Git
   - Instala dependencias (Foundry, Node.js, etc.)
   - Compila todos los paquetes, incluyendo barretenberg

3. **El binario `bb` estará disponible en:**
   ```bash
   ./barretenberg/cpp/build/bin/bb
   ```

4. **Agregar al PATH (opcional):**
   ```bash
   # Agregar a ~/.zshrc o ~/.bashrc
   export PATH="$PATH:/ruta/a/aztec-packages/barretenberg/cpp/build/bin"
   ```

### Compilar desde aztec-packages

Si necesitas compilar desde fuente:

Si solo necesitas barretenberg y no todo el monorepo:

1. **Navegar al directorio barretenberg:**
   ```bash
   cd aztec-packages/barretenberg
   ```

2. **Construir barretenberg:**
   ```bash
   # En macOS/Linux
   cd cpp
   mkdir -p build
   cd build
   cmake ..
   make -j$(nproc)  # o make -j8 en macOS
   ```

3. **El binario estará en:**
   ```bash
   ./build/bin/bb
   ```

## Verificar instalación

```bash
bb --help
```

Deberías ver la ayuda de barretenberg con comandos como `prove`, `verify`, etc.

## Notas

- Requiere C++ compiler (g++ o clang++)
- Requiere CMake
- El proceso de compilación puede tardar varios minutos
- En macOS, puede requerir instalar dependencias con Homebrew:
  ```bash
  brew install cmake
  ```

## Referencias

- [aztec-packages releases](https://github.com/AztecProtocol/aztec-packages/releases) - **Descarga binarios aquí**
- [aztec-packages repository](https://github.com/AztecProtocol/aztec-packages)
- [barretenberg directory](https://github.com/AztecProtocol/aztec-packages/tree/next/barretenberg)

## Nota

**Recomendación**: Siempre intenta primero con los binarios precompilados de los releases. Solo compila desde fuente si:
- No hay binario para tu sistema operativo
- Necesitas una versión específica no disponible en releases
- Necesitas modificar el código

---

## FASE-6-PLAN.md

# Fase 6: Integración JavaScript/TypeScript con Barretenberg

## Objetivo
Integrar el circuito Noir con JavaScript/TypeScript para generar y verificar proofs programáticamente desde la aplicación web.

## Referencia
Documentación oficial: https://noir-lang.org/docs/tutorials/noirjs_app

## Bibliotecas Necesarias (Versiones Específicas)

**IMPORTANTE**: Como generamos proofs en el **SERVIDOR** (endpoints API), NO necesitamos polyfills para el navegador.

Según la documentación oficial (https://noir-lang.org/docs/tutorials/noirjs_app), para uso en servidor necesitamos:

```bash
npm install @noir-lang/noir_js@1.0.0-beta.15 @aztec/bb.js@3.0.0-nightly.20251104
```

**NO necesitamos:**
- ❌ `buffer` - Ya disponible en Node.js
- ❌ `vite-plugin-node-polyfills` - Solo necesario para navegador
- ❌ Configuración especial de Vite - Solo para navegador

**Explicación de cada paquete:**
- `@noir-lang/noir_js@1.0.0-beta.15` - Interfaz principal para cargar y ejecutar circuitos Noir
- `@aztec/bb.js@3.0.0-nightly.20251104` - Backend UltraHonk para generar/verificar proofs

**Dependencias adicionales** (vienen como transitivas):
- `@noir-lang/noirc_abi` - Para inicializar WASM (en servidor)
- `@noir-lang/acvm_js` - Para inicializar WASM (en servidor)

**Ventaja**: Al hacerlo en el servidor, no afectamos el bundle del frontend ni necesitamos polyfills.

## Archivos Necesarios del Circuito

Para usar el circuito en JavaScript, necesitamos:
1. `plonk/target/plonk.json` - El circuito compilado (ACIR) - **Copiar a `static/circuits/plonk/plonk.json`**
2. `plonk/target/vk/vk` - La verification key - **Copiar a `static/circuits/plonk/vk`** (para verificación)
3. El witness se genera dinámicamente usando `noir.execute()`

## Estructura de Archivos a Crear

```
src/
├── lib/
│   └── utils/
│       ├── noir-circuit-paths.ts    # Paths para archivos Noir
│       ├── noir-proof.ts            # Funciones para generar/verificar proofs
│       └── noir-types.ts            # Tipos TypeScript para Noir
└── routes/
    └── api/
        └── plonk/
            ├── proof/
            │   └── +server.ts       # Endpoint para generar proof
            └── verify/
                └── +server.ts       # Endpoint para verificar proof
```

## Flujo de Trabajo

### Generar Proof:
1. Recibir `pixels` y `hash` del frontend
2. Cargar el circuito compilado (`plonk.json`)
3. Crear inputs: `{ pixels: [48 valores], expected_hash: hash }`
4. Generar witness usando `noir_js`
5. Generar proof usando `bb.js` o `backend_barretenberg`
6. Retornar `{ proof, publicSignals }`

### Verificar Proof:
1. Recibir `proof` y `publicSignals` del frontend
2. Cargar la verification key (`vk/vk`)
3. Verificar usando `bb.js` o `backend_barretenberg`
4. Verificar que el hash en `publicSignals` coincida con el reference hash
5. Retornar resultado

## Pasos Detallados (Siguiendo la Documentación)

### Paso 1: Instalar Dependencias (Solo para Servidor)
```bash
npm install @noir-lang/noir_js@1.0.0-beta.15 @aztec/bb.js@3.0.0-nightly.20251104
```

**Sin polyfills** - Todo corre en Node.js (servidor) donde Buffer y otras APIs ya están disponibles.

### Paso 2: Configurar Vite
**NO ES NECESARIO** - Como hacemos todo en el servidor, no necesitamos configurar Vite con polyfills.

### Paso 3: Copiar Archivos del Circuito
Copiar `plonk/target/plonk.json` a `static/circuits/plonk/plonk.json` para que esté accesible.

### Paso 4: Crear Utilidades TypeScript
Crear funciones para:
- Cargar y inicializar el circuito Noir
- Inicializar el backend Barretenberg
- Generar witness
- Generar proof
- Verificar proof

### Paso 5: Crear Endpoints API
Crear `/api/plonk/proof` y `/api/plonk/verify` siguiendo el patrón de los endpoints existentes.

### Paso 6: Probar Integración
Probar el flujo completo desde el frontend.

---

## VERSION-COMPATIBILITY.md

# Version Compatibility

## Recommended Versions (Working Combination)

Based on community recommendations:
- **Noir**: `1.0.0-beta.3`
- **Barretenberg (bb)**: `0.82.2`

## Current Versions
- **Noir**: `1.0.0-beta.15` (needs to be downgraded)
- **Barretenberg**: (check with `bb --version`)

## How to Change Noir Version

### Option 1: Install Specific Version with Cargo
```bash
cargo install --version 1.0.0-beta.3 nargo
```

### Option 2: Use asdf/noirup (if available)
```bash
# Check if noirup supports version pinning
noirup --version 1.0.0-beta.3
```

### Option 3: Build from Source
```bash
git clone https://github.com/noir-lang/noir.git
cd noir
git checkout v1.0.0-beta.3
cargo install --path ./crates/nargo
```

## How to Install bb 0.82.2

### From Releases
1. Go to: https://github.com/AztecProtocol/aztec-packages/releases
2. Find a release that includes bb 0.82.2
3. Download the appropriate binary for your OS

### Or Build from Source
```bash
git clone https://github.com/AztecProtocol/aztec-packages.git
cd aztec-packages/barretenberg
git checkout <tag-with-0.82.2>
# Follow build instructions
```

## Verification

After installing, verify versions:
```bash
nargo --version  # Should show 1.0.0-beta.3
bb --version     # Should show 0.82.2 or compatible
```

## Notes

- Downgrading Noir might require updating dependencies in `Nargo.toml`
- The Poseidon library version might need to match the Noir version
- Test with the simplified circuit first to confirm compatibility

---

## KNOWN-ISSUE.md

# Known Issue: bb prove Conversion Error

## Problem
Even with a simplified circuit (just returning `pixels[0]`), `bb prove` fails with:
```
Assertion failed: (uint256_t(fr_vec[1]) < (uint256_t(1) << (TOTAL_BITS - NUM_LIMB_BITS * 2)))
Reason : Conversion error here usually implies some bad proof serde or parsing
```

## Root Cause
This appears to be a **version incompatibility** between `nargo` and `bb` (Barretenberg), or a serialization issue in how Barretenberg processes the witness.

Since even the simplest circuit fails, this is NOT a Poseidon-specific issue.

## Current Versions
- `nargo`: 1.0.0-beta.15
- `bb`: (need to check with `bb --version`)

## Solutions to Try

### 1. Check Version Compatibility
```bash
nargo --version
bb --version
```

Check if there's a known compatible version combination.

### 2. Try Different bb Version
Download a different version of bb from releases that might be compatible with nargo 1.0.0-beta.15.

### 3. Use JavaScript/TypeScript Integration Instead
For the Fase 6 (JavaScript integration), we can use a JavaScript library for Barretenberg instead of the CLI:
- `@noir-lang/barretenberg` (if available)
- Or use the Noir TypeScript SDK which handles proof generation programmatically

### 4. Wait for Fix
This might be a known bug that will be fixed in future versions.

## Next Steps
Since the CLI approach is blocked, we should:
1. Document this issue
2. Move forward with Fase 6 (JavaScript integration) using programmatic proof generation
3. The JavaScript SDK might handle the serialization differently and avoid this issue

---

## README-TESTING.md

# Fase 4: Compilar y Probar el Circuito Noir

Esta guía explica cómo compilar y probar el circuito Noir.

## Prerequisitos

- `nargo` instalado (ya lo tienes)
- `bb` (Barretenberg) instalado - Ver [INSTALL-BARRETENBERG.md](./INSTALL-BARRETENBERG.md) para instrucciones detalladas

## Paso 1: Generar Prover.toml con valores de prueba

El script `test-circuit.js` calcula el hash usando la misma implementación de Poseidon que el circuito y genera el `Prover.toml` con valores correctos.

```bash
cd plonk
node test-circuit.js
```

Este script:
- Carga los valores de prueba de `static/input.json`
- Calcula el hash usando Poseidon (compatible con Noir's bn254)
- Genera `Prover.toml` con los valores correctos

## Paso 2: Verificar que el circuito compila

```bash
nargo check
```

Esto debería compilar sin errores.

## Paso 3: Compilar el circuito a ACIR

```bash
nargo compile
```

Esto generará:
- `target/plonk.json` - El circuito compilado en formato ACIR

## Paso 4: Generar el witness (testigo)

```bash
nargo execute
```

Esto generará:
- `target/plonk.gz` - El witness (testigo) del circuito con los inputs de `Prover.toml`

## Paso 5: Generar la verification key (vk)

**IMPORTANTE**: `bb write_vk` agrega `/vk` internamente al path que le pasas. Necesitas crear el directorio primero:

```bash
# Crear el directorio para VK
mkdir -p ./target/vk

# Generar la verification key (bb agregará /vk internamente, creando ./target/vk/vk)
bb write_vk -b ./target/plonk.json -o ./target/vk
```

Esto generará:
- `target/vk/vk` - La verification key (clave de verificación)

## Paso 6: Generar un proof con Barretenberg

**IMPORTANTE**: `bb prove` también espera un directorio, NO un archivo:

```bash
bb prove -b ./target/plonk.json -w ./target/plonk.gz -o ./target
```

Esto generará:
- `target/proof` - El proof generado (dentro del directorio target)

## Paso 7: Verificar el proof

```bash
# Usar la ruta correcta según cómo generaste la vk en el paso 5
# Si usaste: bb write_vk -b ./target/plonk.json -o ./target/vk
bb verify -k ./target/vk/vk -p ./target/proof

# O si usaste: bb write_vk -b ./target/plonk.json -o ./target/vk.bin
# bb verify -k ./target/vk.bin/vk -p ./target/proof
```

## Resumen completo de comandos (FINAL - FUNCIONA)

```bash
# 1. Compilar el circuito
nargo compile

# 2. Generar witness
nargo execute

# 3. Crear directorio para VK
mkdir -p ./target/vk

# 4. Generar verification key
bb write_vk -b ./target/plonk.json -o ./target/vk

# 5. Generar proof (OJO: directorio, NO archivo)
bb prove -b ./target/plonk.json -w ./target/plonk.gz -o ./target

# 6. Verificar proof
bb verify -k ./target/vk/vk -p ./target/proof

# 7. Verificar archivos generados
ls -la target/
ls -la target/vk/
```

Esto verificará que el proof es válido.

## Notas

- El hash calculado por `circomlibjs` debería ser compatible con Noir's `bn254::hash_12` y `bn254::hash_4` ya que ambos usan la misma implementación de Poseidon.
- Si el proof falla, verifica que el hash en `Prover.toml` coincida con el calculado por el circuito.
- En versiones recientes de Noir, `nargo prove` y `nargo verify` fueron removidos. Ahora se usa Barretenberg (`bb`) para generar y verificar proofs.

---

## TROUBLESHOOTING.md

# Troubleshooting: Error "Conversion error" en bb prove

## Error
```
Assertion failed: (uint256_t(fr_vec[1]) < (uint256_t(1) << (TOTAL_BITS - NUM_LIMB_BITS * 2)))
Reason : Conversion error here usually implies some bad proof serde or parsing
```

## Posibles causas

### 1. Incompatibilidad de versiones
El error sugiere un problema de serialización/deserialización entre nargo y bb.

**Solución**: Verificar que las versiones sean compatibles:
```bash
nargo --version
bb --version
```

### 2. Problema con el formato del hash en Prover.toml
El hash está en formato hexadecimal (`0x...`), pero podría necesitar estar en decimal.

**Solución**: Cambiar el formato del hash en `Prover.toml`:
```toml
# En lugar de:
expected_hash = "0x0420310fac92df59b1e6f06478b22f9c01ba296f5ec2f65de0ac4fa13cbc46b9"

# Probar con:
expected_hash = "0"  # O el valor decimal equivalente
```

### 3. Problema con el circuito compilado
El archivo `plonk.json` podría estar corrupto o en un formato incompatible.

**Solución**: Recompilar desde cero:
```bash
rm -rf target/
nargo compile
nargo execute
bb write_vk -b ./target/plonk.json -o ./target/vk
bb prove -b ./target/plonk.json -w ./target/plonk.gz -o ./target/proof
```

### 4. Simplificar el circuito para debugging
Temporalmente simplificar el circuito para aislar el problema:

```rust
fn main(
    pixels: [Field; 48],
    expected_hash: pub Field
) -> pub Field {
    // Simplificar: solo retornar el primer pixel
    pixels[0]
}
```

Si esto funciona, el problema está en la función de hash Poseidon.

### 5. Verificar que nargo execute funciona
Si `nargo execute` funciona pero `bb prove` falla, el problema está en Barretenberg, no en el circuito.

## Próximos pasos

1. Verificar versiones de nargo y bb
2. Probar con `expected_hash = "0"` en Prover.toml
3. Recompilar desde cero
4. Si persiste, considerar usar una versión diferente de bb o nargo

---

# Fin del respaldo

