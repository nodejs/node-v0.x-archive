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
 * Copyright (c) 2013, Joyent, Inc. All rights reserved.
 */

/*
 * v8dbg.h: macros for use by V8 heap inspection tools.  The consumer must
 * define values for various tags and shifts.  The MDB module gets these
 * constants from information encoded in the binary itself.
 */

#ifndef _V8DBG_H
#define	_V8DBG_H

/*
 * Recall that while V8 heap objects are always 4-byte aligned, heap object
 * pointers always have the last bit set.  So when looking for a field nominally
 * at offset X, one must be sure to clear the tag bit first.
 */
#define	V8_OFF_HEAP(x)			((x) - V8_HeapObjectTag)

/*
 * Determine whether a given pointer refers to a SMI, Failure, or HeapObject.
 */
#define	V8_IS_SMI(ptr)		(((ptr) & V8_SmiTagMask) == V8_SmiTag)
#define	V8_IS_FAILURE(ptr)	(((ptr) & V8_FailureTagMask) == V8_FailureTag)
#define	V8_IS_HEAPOBJECT(ptr)	\
	(((ptr) & V8_HeapObjectTagMask) == V8_HeapObjectTag)

/*
 * Extract the value of a SMI "pointer".  Recall that small integers are stored
 * using the upper 31 bits.
 */
#define	V8_SMI_VALUE(smi)	((smi) >> (V8_SmiValueShift + V8_SmiShiftSize))

/*
 * Determine the encoding and representation of a V8 string.
 */
#define	V8_TYPE_STRING(type)	(((type) & V8_IsNotStringMask) == V8_StringTag)

#define	V8_STRENC_ASCII(type)	\
	(((type) & V8_StringEncodingMask) == V8_AsciiStringTag)

#define	V8_STRREP_SEQ(type)	\
	(((type) & V8_StringRepresentationMask) == V8_SeqStringTag)
#define	V8_STRREP_CONS(type)	\
	(((type) & V8_StringRepresentationMask) == V8_ConsStringTag)
#define	V8_STRREP_EXT(type)	\
	(((type) & V8_StringRepresentationMask) == V8_ExternalStringTag)

/*
 * Several of the following constants and transformations are hardcoded in V8 as
 * well, so there's no way to extract them programmatically from the binary.
 */
#define	V8_DESC_KEYIDX(x)		((x) + V8_PROP_IDX_FIRST)
#define	V8_DESC_VALIDX(x)		((x) << 1)
#define	V8_DESC_DETIDX(x)		(((x) << 1) + 1)

#define	V8_DESC_ISFIELD(x)		\
	((V8_SMI_VALUE(x) & V8_PROP_TYPE_MASK) == V8_PROP_TYPE_FIELD)

#endif /* _V8DBG_H */
