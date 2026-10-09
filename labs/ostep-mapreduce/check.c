/* Supplemental integration client for the author's MapReduce API.
 * Implements test inputs and observation only; no MapReduce implementation.
 */
#define _POSIX_C_SOURCE 200809L
#include "mapreduce.h"
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static pthread_mutex_t observations = PTHREAD_MUTEX_INITIALIZER;
static int active, peak, mapped, order_error;
static char previous[16][64];

static void map_file(char *filename) {
    pthread_mutex_lock(&observations);
    active++;
    if (active > peak) peak = active;
    pthread_mutex_unlock(&observations);
    /* Make overlap observable without assuming mapper work is CPU intensive. */
    struct timespec duration = {0, 20000000};
    nanosleep(&duration, NULL);
    FILE *file = fopen(filename, "r");
    if (!file) { perror("test input"); exit(2); }
    char word[64], value[8];
    while (fscanf(file, "%63s", word) == 1) {
        strcpy(value, "1");
        MR_Emit(word, value);
        /* The original contract requires the library to copy both strings. */
        strcpy(value, "9");
    }
    fclose(file);
    memset(word, 0, sizeof(word));
    pthread_mutex_lock(&observations);
    active--; mapped++;
    pthread_mutex_unlock(&observations);
}

static void reduce_key(char *key, Getter next, int partition) {
    if (partition < 0 || partition >= 16) exit(3);
    int count = 0, iterations = 0;
    char *value;
    while ((value = next(key, partition)) != NULL) {
        count += atoi(value);
        if (++iterations > 200000) exit(4);
    }
    pthread_mutex_lock(&observations);
    if (previous[partition][0] && strcmp(previous[partition], key) >= 0) order_error = 1;
    snprintf(previous[partition], sizeof(previous[partition]), "%s", key);
    printf("%s %d %d\n", key, count, partition);
    pthread_mutex_unlock(&observations);
}

static unsigned long all_in_zero(char *key, int partitions) {
    (void)key; (void)partitions;
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 4) return 2;
    int mappers = atoi(argv[1]), reducers = atoi(argv[2]), custom = atoi(argv[3]);
    if (mappers < 1 || reducers < 1 || reducers > 16) return 2;
    MR_Run(argc - 3, argv + 3, map_file, mappers, reduce_key, reducers,
           custom ? all_in_zero : MR_DefaultHashPartition);
    fprintf(stderr, "mapped=%d peak=%d order_error=%d\n", mapped, peak, order_error);
    return order_error ? 5 : 0;
}
