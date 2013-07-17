/*
 * CDDL HEADER START
 *
 * The contents of this file are subject to the terms of the
 * Common Development and Distribution License (the "License").
 * You may not use this file except in compliance with the License.
 *
 * You can obtain a copy of the license at usr/src/OPENSOLARIS.LICENSE
 * or http://www.opensolaris.org/os/licensing.
 * See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL HEADER in each
 * file and include the License file at usr/src/OPENSOLARIS.LICENSE.
 * If applicable, add the following below this CDDL HEADER, with the
 * fields enclosed by brackets "[]" replaced with your own identifying
 * information: Portions Copyright [yyyy] [name of copyright owner]
 *
 * CDDL HEADER END
 */
/*
 * Copyright (c) 2012, Joyent, Inc. All rights reserved.
 */

/*
 * v8cfg.h: canned configurations for previous V8 versions
 */

#ifndef V8CFG_H
#define	V8CFG_H

#include <sys/types.h>
#include <sys/mdb_modapi.h>

typedef struct {
	const char 	*v8cs_name;	/* symbol name */
	intptr_t	v8cs_value;	/* symbol value */
} v8_cfg_symbol_t;

typedef struct v8_cfg {
	const char 	*v8cfg_name;	/* canned config name */
	const char 	*v8cfg_label;	/* description */
	v8_cfg_symbol_t	*v8cfg_symbols;	/* actual symbol values */

	int (*v8cfg_iter)(struct v8_cfg *, int (*)(mdb_symbol_t *, void *),
	    void *);
	int (*v8cfg_readsym)(struct v8_cfg *, const char *, intptr_t *);
} v8_cfg_t;

extern v8_cfg_t v8_cfg_04;
extern v8_cfg_t v8_cfg_06;
extern v8_cfg_t v8_cfg_target;
extern v8_cfg_t *v8_cfgs[];

#endif /* V8CFG_H */
