VERSION="2.17.0"
NAME="opensearch-dashboards-min"

SOURCES=(
    "https://artifacts.opensearch.org/releases/core/opensearch-dashboards/${VERSION}/opensearch-dashboards-min-${VERSION}-linux-x64.tar.gz"
)


root_dir="opensearch-dashboards-2.17.0-linux-x64"

function prepare_root() {
    find  "$root_dir" -type f -name "*.br" | xargs rm -vf
    echo "$root_dir"
}

function analyze() {
    exec_bun ./src/cli/cli.js  -e http://go.dmo-test1.intra.matrixflowsapp.com:9200 &
    sleep 5s
    browser_navigate http://localhost:5601/app/dev_tools#/console
}

function postbuild() {
    cd "$OUT_DIR"
    if ! grep -q 'opensearch.ignoreVersionMismatch: true' "./config/opensearch_dashboards.yml"; then
        echo 'opensearch.ignoreVersionMismatch: true' >>"./config/opensearch_dashboards.yml"
    fi
    if [[ -d "./node_modules" ]]; then
        mv "./node_modules" "./src/node_modules"
    fi
    rm -rf data NOTICE.txt README.txt LICENSE.txt
    du -sh "$OUT_DIR" >&2
}

# All=5995 Files=4415 Read=4339 StatOnly=1656 TotalSize=22.58 MB
# All=5612 Files=4407 Read=4327 StatOnly=1285 TotalSize=19.66 MB
